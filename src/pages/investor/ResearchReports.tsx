import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Upload, Search, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ResearchReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports] = useState([
    {
      id: "1",
      title: "Global Market Outlook Q1 2025",
      category: "Market Analysis",
      date: "2025-01-10",
      description: "Comprehensive analysis of global market trends and opportunities",
      fileSize: "2.4 MB"
    },
    {
      id: "2",
      title: "Emerging Markets Report",
      category: "Regional Analysis",
      date: "2025-01-08",
      description: "Deep dive into emerging market opportunities across Asia and Africa",
      fileSize: "3.1 MB"
    },
    {
      id: "3",
      title: "Technology Sector Overview",
      category: "Sector Analysis",
      date: "2025-01-05",
      description: "Analysis of tech sector trends and leading companies",
      fileSize: "1.8 MB"
    },
  ]);

  const handleUpload = () => {
    toast.success("Report upload functionality ready for integration");
  };

  const handleAIInsights = () => {
    toast.info("AI-powered insights feature coming soon");
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Reports</h1>
          <p className="text-muted-foreground mt-2">
            In-depth research and analysis on global investment opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAIInsights} className="bg-primary hover:bg-primary/90">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          <Button onClick={handleUpload} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
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

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{report.category}</Badge>
              </div>
              <CardTitle className="mt-4">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>{report.date}</span>
                <span>{report.fileSize}</span>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResearchReports;
