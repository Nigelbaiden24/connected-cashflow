import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, TrendingUp, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StockReportScraper() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    setResult("");
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, formats: ["markdown"] },
      });
      if (error) throw error;
      const md = (data as any)?.markdown || (data as any)?.data?.markdown || JSON.stringify(data, null, 2);
      setResult(md);
      toast.success("Stock report scraped");
    } catch (e: any) {
      toast.error(e.message || "Scrape failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Stock Report Scraper</CardTitle>
              <CardDescription>Scrape equity research reports and analyst notes from any URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/stock-report"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleScrape} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              <span className="ml-2">Scrape</span>
            </Button>
          </div>
          {result && (
            <Textarea value={result} readOnly className="min-h-[400px] font-mono text-xs" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
