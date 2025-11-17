import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Upload, Search, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

const AnalysisReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports] = useState([
    {
      id: "1",
      title: "Bitcoin Technical Analysis",
      category: "Cryptocurrency",
      type: "Technical",
      date: "2025-01-12",
      status: "bullish"
    },
    {
      id: "2",
      title: "US Real Estate Market Trends",
      category: "Property",
      type: "Fundamental",
      date: "2025-01-11",
      status: "neutral"
    },
    {
      id: "3",
      title: "Gold Price Forecast",
      category: "Precious Metals",
      type: "Quantitative",
      date: "2025-01-10",
      status: "bullish"
    },
  ]);

  const handleAIAnalysis = () => {
    toast.info("Generating AI-powered analysis...");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bullish":
        return "bg-green-500";
      case "bearish":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Reports</h1>
          <p className="text-muted-foreground mt-2">
            Technical, fundamental, and quantitative analysis across all asset classes
          </p>
        </div>
        <Button onClick={handleAIAnalysis} className="bg-primary hover:bg-primary/90">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Analysis
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
          <TabsTrigger value="quantitative">Quantitative</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search analysis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(report.status)}`} />
                    </div>
                    <Badge variant="secondary">{report.category}</Badge>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{report.type}</Badge>
                    <span>{report.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analysis
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisReports;
