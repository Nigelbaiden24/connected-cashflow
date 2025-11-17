import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Search, Filter, TrendingUp, TrendingDown, Activity, Target, BarChart3, Zap } from "lucide-react";

const ResearchReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const companyReports = [
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      sector: "Technology",
      price: "$182.45",
      change: "+3.21%",
      positive: true,
      aiRatings: {
        growth: { score: 85, label: "Strong", color: "text-green-600" },
        momentum: { score: 78, label: "Good", color: "text-green-600" },
        financialHealth: { score: 92, label: "Excellent", color: "text-green-600" }
      },
      sentiment: { score: 82, label: "Bullish", positive: true },
      earningsStability: { score: 88, volatility: "Low", trend: "Consistent" },
      peerComparison: [
        { name: "AAPL", value: 92, current: true },
        { name: "MSFT", value: 89 },
        { name: "GOOGL", value: 85 },
        { name: "META", value: 78 }
      ]
    },
    {
      id: "2",
      symbol: "TSLA",
      company: "Tesla Inc.",
      sector: "Automotive",
      price: "$245.18",
      change: "+5.23%",
      positive: true,
      aiRatings: {
        growth: { score: 92, label: "Excellent", color: "text-green-600" },
        momentum: { score: 88, label: "Strong", color: "text-green-600" },
        financialHealth: { score: 72, label: "Moderate", color: "text-yellow-600" }
      },
      sentiment: { score: 75, label: "Bullish", positive: true },
      earningsStability: { score: 65, volatility: "Medium", trend: "Growing" },
      peerComparison: [
        { name: "TSLA", value: 88, current: true },
        { name: "F", value: 68 },
        { name: "GM", value: 65 },
        { name: "RIVN", value: 52 }
      ]
    },
    {
      id: "3",
      symbol: "NVDA",
      company: "NVIDIA Corp",
      sector: "Semiconductors",
      price: "$875.32",
      change: "+8.45%",
      positive: true,
      aiRatings: {
        growth: { score: 95, label: "Exceptional", color: "text-green-600" },
        momentum: { score: 94, label: "Exceptional", color: "text-green-600" },
        financialHealth: { score: 89, label: "Strong", color: "text-green-600" }
      },
      sentiment: { score: 91, label: "Very Bullish", positive: true },
      earningsStability: { score: 85, volatility: "Low", trend: "Strong Growth" },
      peerComparison: [
        { name: "NVDA", value: 95, current: true },
        { name: "AMD", value: 82 },
        { name: "INTC", value: 68 },
        { name: "QCOM", value: 75 }
      ]
    },
    {
      id: "4",
      symbol: "JPM",
      company: "JPMorgan Chase",
      sector: "Banking",
      price: "$178.90",
      change: "-1.12%",
      positive: false,
      aiRatings: {
        growth: { score: 68, label: "Moderate", color: "text-yellow-600" },
        momentum: { score: 62, label: "Neutral", color: "text-yellow-600" },
        financialHealth: { score: 86, label: "Strong", color: "text-green-600" }
      },
      sentiment: { score: 58, label: "Neutral", positive: null },
      earningsStability: { score: 82, volatility: "Low", trend: "Stable" },
      peerComparison: [
        { name: "JPM", value: 86, current: true },
        { name: "BAC", value: 78 },
        { name: "WFC", value: 72 },
        { name: "C", value: 69 }
      ]
    }
  ];

  const getRatingColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-green-500";
    if (score >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-green-500";
    if (score >= 55) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Reports</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered company analysis with ratings, peer comparisons, and sentiment scores
          </p>
          <Badge variant="secondary" className="mt-2">
            Non-Advisory Research Only
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Company Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {companyReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="font-bold">{report.symbol}</Badge>
                    <Badge variant="outline">{report.sector}</Badge>
                  </div>
                  <CardTitle className="text-xl">{report.company}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold">{report.price}</span>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${
                      report.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {report.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ratings" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="peers">Peers</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                </TabsList>

                <TabsContent value="ratings" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Growth Score</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${report.aiRatings.growth.color}`}>
                            {report.aiRatings.growth.score}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                        </div>
                      </div>
                      <Progress value={report.aiRatings.growth.score} className="h-2" />
                      <p className={`text-xs mt-1 ${report.aiRatings.growth.color}`}>
                        {report.aiRatings.growth.label}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Momentum Score</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${report.aiRatings.momentum.color}`}>
                            {report.aiRatings.momentum.score}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                        </div>
                      </div>
                      <Progress value={report.aiRatings.momentum.score} className="h-2" />
                      <p className={`text-xs mt-1 ${report.aiRatings.momentum.color}`}>
                        {report.aiRatings.momentum.label}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Financial Health</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${report.aiRatings.financialHealth.color}`}>
                            {report.aiRatings.financialHealth.score}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                        </div>
                      </div>
                      <Progress value={report.aiRatings.financialHealth.score} className="h-2" />
                      <p className={`text-xs mt-1 ${report.aiRatings.financialHealth.color}`}>
                        {report.aiRatings.financialHealth.label}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="peers" className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Sector Peer Comparison</span>
                  </div>
                  {report.peerComparison.map((peer, idx) => (
                    <div key={idx} className={`space-y-1 ${peer.current ? 'bg-primary/5 p-2 rounded-lg' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${peer.current ? 'font-bold' : ''}`}>
                          {peer.name}
                          {peer.current && <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>}
                        </span>
                        <span className={`text-sm font-semibold ${getRatingColor(peer.value)}`}>
                          {peer.value}
                        </span>
                      </div>
                      <div className="relative w-full bg-muted rounded-full h-2">
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(peer.value)}`}
                          style={{ width: `${peer.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="sentiment" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Market Sentiment Analysis</span>
                  </div>
                  <div className="text-center py-4">
                    <div className={`text-6xl font-bold mb-2 ${
                      report.sentiment.positive === null ? 'text-yellow-600' :
                      report.sentiment.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.sentiment.score}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Sentiment Score</p>
                    <Badge variant={
                      report.sentiment.positive === null ? "secondary" :
                      report.sentiment.positive ? "default" : "destructive"
                    }>
                      {report.sentiment.label}
                    </Badge>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-3">
                    <div 
                      className={`absolute top-0 left-0 h-3 rounded-full ${
                        report.sentiment.positive === null ? 'bg-yellow-600' :
                        report.sentiment.positive ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${report.sentiment.score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                    <div className="text-red-600">Bearish</div>
                    <div className="text-yellow-600">Neutral</div>
                    <div className="text-green-600">Bullish</div>
                  </div>
                </TabsContent>

                <TabsContent value="earnings" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Earnings Stability Analysis</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Stability Score</span>
                        <span className={`text-2xl font-bold ${getRatingColor(report.earningsStability.score)}`}>
                          {report.earningsStability.score}
                        </span>
                      </div>
                      <Progress value={report.earningsStability.score} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                        <p className={`text-sm font-semibold ${
                          report.earningsStability.volatility === "Low" ? 'text-green-600' :
                          report.earningsStability.volatility === "Medium" ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {report.earningsStability.volatility}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground mb-1">Trend</p>
                        <p className="text-sm font-semibold text-primary">
                          {report.earningsStability.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button className="w-full mt-4" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResearchReports;
