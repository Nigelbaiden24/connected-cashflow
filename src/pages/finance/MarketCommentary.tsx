import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Loader2, Send, TrendingUp, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import ReactMarkdown from "react-markdown";

interface Report {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  published_date: string;
  author?: string;
}

export default function FinanceMarketCommentary() {
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [commentaries, setCommentaries] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { analyzeWithAI, isLoading: aiLoading } = useAIAnalyst({
    onDelta: (text) => setAiResponse((prev) => prev + text),
    onDone: () => toast({ title: "Analysis complete" }),
    onError: (error) => toast({ title: "Error", description: error, variant: "destructive" }),
  });

  useEffect(() => {
    fetchCommentaries();
  }, []);

  const fetchCommentaries = async () => {
    try {
      const { data, error } = await supabase
        .from("market_commentary")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setCommentaries(data || []);
    } catch (error) {
      console.error("Error fetching commentaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setAiResponse("");
    await analyzeWithAI(aiQuery, "market");
    setAiQuery("");
  };

  const handleViewReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from("reports")
        .createSignedUrl(report.file_path, 3600);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      toast({ title: "Error", description: "Could not open report", variant: "destructive" });
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from("reports")
        .download(report.file_path);

      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Could not download report", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Commentary</h1>
        <p className="text-muted-foreground mt-2">Expert analysis and insights on current market conditions</p>
      </div>

      {/* AI Assistant */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Market Analyst
          </CardTitle>
          <CardDescription>Ask questions about market trends and get AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about market trends, sectors, or economic indicators..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleAIQuery} disabled={aiLoading || !aiQuery.trim()}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Analyze
          </Button>

          {aiResponse && (
            <Card className="mt-4 bg-muted/50">
              <CardContent className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Commentary List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Latest Commentary</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : commentaries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No market commentary available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commentaries.map((commentary) => (
              <Card key={commentary.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-2">Commentary</Badge>
                  </div>
                  <CardTitle className="text-lg">{commentary.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{commentary.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(commentary.published_date).toLocaleDateString()}
                    </div>
                    {commentary.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {commentary.author}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewReport(commentary)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReport(commentary)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
