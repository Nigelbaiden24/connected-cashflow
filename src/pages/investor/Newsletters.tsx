import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Search, Calendar, Eye, Sparkles, TrendingUp, Newspaper } from "lucide-react";
import { toast } from "sonner";

const Newsletters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const weeklyRoundups = [
    {
      id: "1",
      title: "AI Weekly Roundup",
      edition: "Week of January 12, 2025",
      preview: "This week in markets: Fed signals shift, tech earnings surprise, and crypto momentum builds. Plus: what the smart money is watching next week.",
      aiGenerated: true,
      category: "AI Weekly",
      readTime: "5 min read"
    },
    {
      id: "2",
      title: "AI Weekly Roundup",
      edition: "Week of January 5, 2025",
      preview: "New year, new opportunities: Global markets kick off 2025 with strong momentum. AI stocks lead gains while energy sector shows consolidation.",
      aiGenerated: true,
      category: "AI Weekly",
      readTime: "5 min read"
    },
  ];

  const sectorNewsletters = [
    {
      id: "1",
      sector: "Technology",
      title: "Tech Sector Insights",
      edition: "January 2025",
      preview: "AI revolution accelerates: semiconductor demand surges, cloud computing reaches new highs, and cybersecurity spending increases globally.",
      subscribers: 12453,
      frequency: "Weekly"
    },
    {
      id: "2",
      sector: "Healthcare",
      title: "Healthcare & Biotech Update",
      edition: "January 2025",
      preview: "Breakthrough drug approvals, telemedicine expansion continues, and medical device innovation transforms patient care.",
      subscribers: 8932,
      frequency: "Bi-weekly"
    },
    {
      id: "3",
      sector: "Energy",
      title: "Energy Transition Report",
      edition: "January 2025",
      preview: "Renewable energy capacity hits record highs, oil prices stabilize, and battery technology advances drive EV adoption.",
      subscribers: 7654,
      frequency: "Weekly"
    },
    {
      id: "4",
      sector: "Finance",
      title: "Financial Services Digest",
      edition: "January 2025",
      preview: "Digital banking disruption intensifies, fintech valuations rebound, and regulatory landscape evolves for crypto assets.",
      subscribers: 15234,
      frequency: "Weekly"
    },
    {
      id: "5",
      sector: "Consumer",
      title: "Consumer Trends Quarterly",
      edition: "Q1 2025",
      preview: "E-commerce growth persists, luxury goods demand strong in Asia, and sustainability drives brand loyalty.",
      subscribers: 6543,
      frequency: "Quarterly"
    },
  ];

  const storyDigests = [
    {
      id: "1",
      title: "Monday Morning Markets ☕",
      edition: "January 13, 2025",
      preview: "Good morning! While you were sleeping, Asian markets rallied on strong manufacturing data. Here's what you need to know today...",
      stories: [
        "📈 S&P 500 futures up 0.8% as tech earnings beat expectations",
        "🏦 Fed official hints at March rate decision flexibility", 
        "⚡ Tesla shares jump 4% on China delivery numbers",
        "🌍 European markets open higher on ECB optimism"
      ],
      readTime: "3 min read",
      style: "Morning Brew"
    },
    {
      id: "2",
      title: "Monday Morning Markets ☕",
      edition: "January 6, 2025",
      preview: "Happy New Year! Markets start 2025 with optimism. Here's your quick catch-up on what matters...",
      stories: [
        "🎯 Major indices hit new highs to start the year",
        "💼 Job market data shows continued strength",
        "🏠 Housing starts exceed economist forecasts",
        "🛢️ Oil prices steady as OPEC+ maintains cuts"
      ],
      readTime: "3 min read",
      style: "Morning Brew"
    },
  ];

  const handleSubscribe = () => {
    toast.success("Subscription preferences updated");
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered market insights and sector-specific updates delivered to your inbox
          </p>
        </div>
      </div>

      {/* Subscribe Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Subscribe to Our Newsletters
          </CardTitle>
          <CardDescription>
            Get AI-generated insights and sector updates delivered to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter your email" type="email" />
            <Button onClick={handleSubscribe} className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search newsletters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs for Different Newsletter Types */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Weekly Roundup
          </TabsTrigger>
          <TabsTrigger value="sectors">
            <TrendingUp className="h-4 w-4 mr-2" />
            Sector Newsletters
          </TabsTrigger>
          <TabsTrigger value="digest">
            <Newspaper className="h-4 w-4 mr-2" />
            Story Digest
          </TabsTrigger>
        </TabsList>

        {/* AI Weekly Roundup */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">AI-Generated Weekly Roundups</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Comprehensive market summaries powered by AI, analyzing thousands of data points to bring you what matters most.
          </p>
          
          {weeklyRoundups.map((newsletter) => (
            <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    {newsletter.aiGenerated && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <Badge>{newsletter.readTime}</Badge>
                </div>
                <CardTitle className="mt-4">{newsletter.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {newsletter.edition}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{newsletter.preview}</p>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Read Full Roundup
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Sector Newsletters */}
        <TabsContent value="sectors" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Sector-Specific Newsletters</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Deep dives into specific market sectors with curated insights and analysis.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {sectorNewsletters.map((newsletter) => (
              <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{newsletter.sector}</Badge>
                    <Badge variant="secondary">{newsletter.frequency}</Badge>
                  </div>
                  <CardTitle className="mt-4">{newsletter.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {newsletter.edition}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{newsletter.preview}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {newsletter.subscribers.toLocaleString()} subscribers
                    </span>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Story Digest (Morning Brew Style) */}
        <TabsContent value="digest" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Morning Market Digest</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Quick, engaging market updates in the Morning Brew style. Get up to speed in under 5 minutes.
          </p>

          {storyDigests.map((digest) => (
            <Card key={digest.id} className="hover:shadow-lg transition-shadow border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Newspaper className="h-8 w-8 text-primary" />
                  <div className="flex gap-2">
                    <Badge variant="secondary">{digest.style}</Badge>
                    <Badge>{digest.readTime}</Badge>
                  </div>
                </div>
                <CardTitle className="mt-4">{digest.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {digest.edition}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 font-medium">{digest.preview}</p>
                
                <div className="space-y-2 mb-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Today's Top Stories:</p>
                  {digest.stories.map((story, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {story}
                    </p>
                  ))}
                </div>

                <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                  <Eye className="h-4 w-4 mr-2" />
                  Read Full Digest
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Newsletters;