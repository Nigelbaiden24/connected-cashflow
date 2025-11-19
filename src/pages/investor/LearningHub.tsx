import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Video, 
  TrendingUp, 
  AlertCircle, 
  Receipt, 
  Search,
  BookMarked,
  PlayCircle,
  Factory,
  ShieldAlert,
  Briefcase,
  Library,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LearningHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [guides, setGuides] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [taxGuides, setTaxGuides] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);

  useEffect(() => {
    fetchLearningContent();
  }, []);

  const fetchLearningContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("learning_content")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setGuides(data.filter(item => item.category === "guides"));
        setSectors(data.filter(item => item.category === "sectors"));
        setRisks(data.filter(item => item.category === "risks"));
        setTaxGuides(data.filter(item => item.category === "tax"));
        setVideos(data.filter(item => item.category === "videos"));
        setGlossary(data.filter(item => item.category === "glossary"));
      }
    } catch (error: any) {
      console.error("Error fetching learning content:", error);
      toast.error("Failed to load learning content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContent = async (content: any) => {
    setSelectedContent(content);
    setContentDialogOpen(true);

    // Increment view count
    try {
      await supabase.rpc("increment_learning_content_views", {
        content_id: content.id
      });

      // Track user progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("learning_progress")
          .upsert({
            user_id: user.id,
            content_id: content.id,
            last_accessed_at: new Date().toISOString()
          }, {
            onConflict: "user_id,content_id"
          });
      }
    } catch (error) {
      console.error("Error tracking content view:", error);
    }
  };

  const markAsCompleted = async (contentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to track your progress");
        return;
      }

      await supabase
        .from("learning_progress")
        .upsert({
          user_id: user.id,
          content_id: contentId,
          completed: true,
          progress_percentage: 100,
          completed_at: new Date().toISOString()
        }, {
          onConflict: "user_id,content_id"
        });

      toast.success("Marked as completed!");
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error("Failed to update progress");
    }
  };

  const beginnerGuides = [
    {
      title: "What is Investing?",
      description: "Learn the fundamentals of investing and how markets work",
      duration: "10 min read",
      topics: ["Stocks", "Bonds", "Markets", "Risk"],
    },
    {
      title: "Building Your First Portfolio",
      description: "Step-by-step guide to creating a diversified investment portfolio",
      duration: "15 min read",
      topics: ["Diversification", "Asset Allocation", "Rebalancing"],
    },
    {
      title: "Understanding Risk & Return",
      description: "The relationship between investment risk and potential returns",
      duration: "12 min read",
      topics: ["Risk Tolerance", "Volatility", "Expected Returns"],
    },
    {
      title: "Investment Strategies for Beginners",
      description: "Common investment approaches and how to choose the right one",
      duration: "18 min read",
      topics: ["Value Investing", "Growth Investing", "Index Funds"],
    },
    {
      title: "Reading Financial Statements",
      description: "How to analyze company financial reports and key metrics",
      duration: "20 min read",
      topics: ["Balance Sheet", "Income Statement", "Cash Flow"],
    },
  ];

  const sectorExplainers = [
    {
      sector: "Technology",
      description: "Software, hardware, semiconductors, and IT services",
      keyMetrics: ["Revenue Growth", "R&D Spending", "Market Share"],
      majorPlayers: ["Apple", "Microsoft", "NVIDIA", "Google"],
    },
    {
      sector: "Healthcare",
      description: "Pharmaceuticals, biotechnology, medical devices, and services",
      keyMetrics: ["Pipeline", "FDA Approvals", "Patent Expiry"],
      majorPlayers: ["Johnson & Johnson", "Pfizer", "UnitedHealth"],
    },
    {
      sector: "Financial Services",
      description: "Banks, insurance, asset management, and fintech",
      keyMetrics: ["Net Interest Margin", "Loan Quality", "AUM"],
      majorPlayers: ["JPMorgan", "Visa", "Berkshire Hathaway"],
    },
    {
      sector: "Consumer Goods",
      description: "Essential and discretionary consumer products",
      keyMetrics: ["Brand Value", "Market Penetration", "Margins"],
      majorPlayers: ["Procter & Gamble", "Amazon", "Nike"],
    },
    {
      sector: "Energy",
      description: "Oil, gas, renewable energy, and utilities",
      keyMetrics: ["Production Volume", "Reserves", "Efficiency"],
      majorPlayers: ["ExxonMobil", "NextEra Energy", "Shell"],
    },
    {
      sector: "Real Estate",
      description: "Property development, REITs, and commercial real estate",
      keyMetrics: ["Occupancy Rate", "FFO", "Cap Rate"],
      majorPlayers: ["Prologis", "American Tower", "Simon Property"],
    },
  ];

  const riskDisclosures = [
    {
      risk: "Market Risk",
      explanation: "The possibility that investments will lose value due to market movements",
      mitigation: "Diversify across asset classes and maintain a long-term perspective",
      severity: "Medium-High",
    },
    {
      risk: "Liquidity Risk",
      explanation: "The risk that you cannot sell an investment quickly without significant loss",
      mitigation: "Maintain adequate cash reserves and invest in liquid securities",
      severity: "Low-Medium",
    },
    {
      risk: "Inflation Risk",
      explanation: "The risk that your returns will not keep pace with rising prices",
      mitigation: "Include inflation-protected securities and real assets in your portfolio",
      severity: "Medium",
    },
    {
      risk: "Currency Risk",
      explanation: "Losses from unfavorable exchange rate movements in foreign investments",
      mitigation: "Use currency hedging or diversify across multiple currencies",
      severity: "Medium",
    },
    {
      risk: "Credit Risk",
      explanation: "The risk that a borrower will default on debt obligations",
      mitigation: "Invest in high-quality bonds and diversify credit exposure",
      severity: "Medium-High",
    },
  ];

  const taxBasics = [
    {
      title: "Individual Savings Account (ISA)",
      description: "Tax-free savings and investment wrapper available to UK residents",
      allowance: "£20,000 per tax year",
      benefits: [
        "No tax on interest, dividends, or capital gains",
        "Flexible withdrawals",
        "Choice of Cash, Stocks & Shares, or Lifetime ISA",
      ],
      considerations: [
        "Annual allowance cannot be carried forward",
        "Must be 16+ for Cash ISA, 18+ for Stocks & Shares ISA",
      ],
    },
    {
      title: "Self-Invested Personal Pension (SIPP)",
      description: "Tax-advantaged personal pension with investment flexibility",
      allowance: "Up to £60,000 per year or 100% of earnings",
      benefits: [
        "25% tax relief on contributions",
        "Tax-free growth within the pension",
        "25% tax-free lump sum at retirement",
      ],
      considerations: [
        "Cannot access funds until age 55 (rising to 57 in 2028)",
        "Annual and lifetime allowance limits apply",
        "Remaining 75% taxed as income when withdrawn",
      ],
    },
  ];

  const videoExplainers = [
    {
      title: "Stock Market Basics",
      duration: "8:24",
      views: "1.2M",
      category: "Beginner",
      thumbnail: "stock-basics",
    },
    {
      title: "How to Read a Balance Sheet",
      duration: "12:15",
      views: "856K",
      category: "Intermediate",
      thumbnail: "balance-sheet",
    },
    {
      title: "Understanding P/E Ratios",
      duration: "6:45",
      views: "642K",
      category: "Beginner",
      thumbnail: "pe-ratio",
    },
    {
      title: "ETFs vs Mutual Funds",
      duration: "10:32",
      views: "923K",
      category: "Beginner",
      thumbnail: "etfs-vs-mf",
    },
    {
      title: "Dividend Investing Strategy",
      duration: "14:18",
      views: "1.1M",
      category: "Intermediate",
      thumbnail: "dividend-strategy",
    },
    {
      title: "Options Trading Explained",
      duration: "18:47",
      views: "2.3M",
      category: "Advanced",
      thumbnail: "options-trading",
    },
  ];

  const glossaryTerms = [
    { term: "Asset Allocation", definition: "The process of dividing investments among different asset categories, such as stocks, bonds, and cash" },
    { term: "Bear Market", definition: "A market condition where prices are falling or expected to fall by 20% or more from recent highs" },
    { term: "Blue Chip", definition: "Shares of large, well-established, and financially sound companies with a history of reliable performance" },
    { term: "Bull Market", definition: "A market condition characterized by rising prices and investor optimism" },
    { term: "Capital Gains", definition: "Profit from the sale of an asset when the selling price exceeds the purchase price" },
    { term: "Diversification", definition: "A risk management strategy that mixes a variety of investments within a portfolio" },
    { term: "Dividend", definition: "A portion of company earnings distributed to shareholders, usually on a quarterly basis" },
    { term: "ETF (Exchange-Traded Fund)", definition: "A type of investment fund that trades on stock exchanges, similar to individual stocks" },
    { term: "Index Fund", definition: "A type of mutual fund or ETF designed to track the performance of a specific market index" },
    { term: "Liquidity", definition: "The ease with which an asset can be converted into cash without affecting its market price" },
    { term: "Market Capitalization", definition: "The total value of a company's outstanding shares, calculated by multiplying share price by number of shares" },
    { term: "Portfolio", definition: "A collection of financial investments like stocks, bonds, commodities, cash, and other assets" },
    { term: "Risk Tolerance", definition: "The degree of variability in investment returns an investor is willing to withstand" },
    { term: "Volatility", definition: "The rate at which the price of a security increases or decreases for a set of returns" },
    { term: "Yield", definition: "The income return on an investment, such as the interest or dividends received" },
  ];

  const filteredGlossary = glossary.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Hub</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive educational resources to help you become a confident investor
        </p>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guides</span>
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Sectors</span>
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Risks</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Glossary</span>
          </TabsTrigger>
        </TabsList>

        {/* Beginner Guides */}
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-blue-500" />
                Beginner Investment Guides
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Essential reading for new investors to build a strong foundation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {beginnerGuides.map((guide, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {guide.duration}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {guide.topics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline">
                        Read Guide
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sector Explainers */}
        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-purple-500" />
                Sector Explainers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understand different market sectors and their characteristics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorExplainers.map((sector, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{sector.sector}</CardTitle>
                      <p className="text-sm text-muted-foreground">{sector.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-2">Key Metrics:</p>
                        <div className="flex flex-wrap gap-2">
                          {sector.keyMetrics.map((metric, idx) => (
                            <Badge key={idx} variant="outline">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">Major Players:</p>
                        <div className="flex flex-wrap gap-2">
                          {sector.majorPlayers.map((player, idx) => (
                            <Badge key={idx}>
                              {player}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Learn More About {sector.sector}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Disclosures */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                Risk Disclosures Simplified
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding the risks involved in investing
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {riskDisclosures.map((risk, index) => (
                  <AccordionItem key={index} value={`risk-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold">{risk.risk}</span>
                        <Badge
                          variant={
                            risk.severity.includes("High")
                              ? "destructive"
                              : risk.severity.includes("Medium")
                              ? "default"
                              : "secondary"
                          }
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div>
                          <p className="text-sm font-semibold mb-1">What it means:</p>
                          <p className="text-sm text-muted-foreground">{risk.explanation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">How to mitigate:</p>
                          <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Important Notice</p>
                    <p className="text-sm text-muted-foreground">
                      All investments carry risk. The value of investments can go down as well as up,
                      and you may get back less than you invested. Past performance is not a guide to
                      future performance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Basics */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-500" />
                UK Tax Basics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding ISAs and SIPPs for tax-efficient investing
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {taxBasics.map((account, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{account.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {account.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {account.allowance}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Key Benefits:
                        </p>
                        <ul className="space-y-1 ml-6">
                          {account.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground list-disc">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Important Considerations:
                        </p>
                        <ul className="space-y-1 ml-6">
                          {account.considerations.map((consideration, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground list-disc">
                              {consideration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Professional Advice</p>
                    <p className="text-sm text-muted-foreground">
                      Tax rules can be complex and change regularly. Consider consulting a qualified
                      financial advisor or tax professional for personalized guidance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Explainers */}
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-red-500" />
                Video Explainers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Visual learning resources to master investment concepts
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videoExplainers.map((video, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-primary" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>{video.duration}</span>
                        <span>{video.views} views</span>
                      </div>
                      <Badge variant="outline">{video.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5 text-indigo-500" />
                Investment Glossary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick reference for common investment terms and definitions
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {filteredGlossary.map((item, index) => (
                  <AccordionItem key={index} value={`term-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {item.term}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{item.definition}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredGlossary.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No terms found matching "{searchTerm}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
