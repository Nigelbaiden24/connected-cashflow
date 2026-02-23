import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Send, Loader2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { supabase } from "@/integrations/supabase/client";
import { ViewModeToggle } from "@/components/showcase/ViewModeToggle";
import { ContentShowcase, ShowcaseItem } from "@/components/showcase/ContentShowcase";

interface Report {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_url: string | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function FinanceMarketCommentary() {
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [commentaries, setCommentaries] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommentaries();
  }, []);

  const fetchCommentaries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_commentary')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setCommentaries(data || []);
    } catch (error) {
      console.error('Error fetching commentaries:', error);
      toast.error('Failed to load market commentaries');
    } finally {
      setLoading(false);
    }
  };

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => setAiResponse(prev => prev + text),
    onDone: () => {
      toast.success("Analysis complete");
    },
    onError: (error) => {
      toast.error(error);
      setAiResponse("");
    }
  });

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setAiResponse("");
    await analyzeWithAI(aiQuery, "trends");
    setAiQuery("");
  };

  const handleViewReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('commentary')
        .createSignedUrl(report.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error accessing report:', error);
      toast.error('Failed to open commentary. Please ensure you have access to this report.');
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('commentary')
        .download(report.file_path);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Commentary downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download commentary');
    }
  };

  const [viewMode, setViewMode] = useState<string>("grid");

  const showcaseItems: ShowcaseItem[] = commentaries.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.published_date ? new Date(c.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
    description: c.description || undefined,
    imageUrl: c.thumbnail_url || undefined,
    icon: <MessageSquare className="h-10 w-10" />,
    badges: [{ label: "Market Commentary" }],
    onClick: () => handleViewReport(c),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Commentary</h1>
          <p className="text-muted-foreground mt-2">
            Expert insights and AI-powered analysis on current market conditions
          </p>
        </div>
        <ViewModeToggle value={viewMode} onChange={setViewMode} options={["grid", "showcase"]} />
      </div>

      {/* AI Chat Interface */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Market Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about market trends, get instant AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about market trends, specific assets, or economic indicators..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleAIQuery} 
            className="mt-4 w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Ask AI Assistant
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Response */}
      {aiResponse && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
              {aiResponse}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commentary Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Latest Commentary</h2>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading market commentaries...</p>
          </div>
        ) : commentaries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No commentaries available</p>
              <p className="text-sm text-muted-foreground text-center">
                Market commentaries uploaded by administrators will appear here
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "showcase" ? (
          <ContentShowcase items={showcaseItems} emptyMessage="No commentaries available" />
        ) : (
          <>
            {commentaries.map((commentary) => (
              <Card key={commentary.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">Market Commentary</Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{commentary.title}</CardTitle>
                  {commentary.description && (
                    <CardDescription className="text-sm mt-2">
                      {commentary.description}
                    </CardDescription>
                  )}
                  {commentary.published_date && (
                    <CardDescription className="text-sm">
                      {new Date(commentary.published_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleViewReport(commentary)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Full Commentary
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDownloadReport(commentary)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
