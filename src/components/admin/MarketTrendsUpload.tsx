import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp } from "lucide-react";

export function MarketTrendsUpload() {
  const [uploading, setUploading] = useState(false);
  const [trendForm, setTrendForm] = useState({
    title: "",
    description: "",
    impact: "",
    timeframe: "",
  });

  const handleTrendUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendForm.title || !trendForm.description || !trendForm.impact || !trendForm.timeframe) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from("market_trends").insert({
        title: trendForm.title,
        description: trendForm.description,
        impact: trendForm.impact,
        timeframe: trendForm.timeframe,
        is_published: true,
      });

      if (error) throw error;

      toast.success("Market trend uploaded successfully!");
      setTrendForm({ title: "", description: "", impact: "", timeframe: "" });
    } catch (error: any) {
      console.error("Error uploading market trend:", error);
      toast.error(error.message || "Failed to upload market trend");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Market Trends</CardTitle>
        </div>
        <CardDescription>Upload market trends for investor benchmarking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTrendUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trend-title">Title *</Label>
            <Input
              id="trend-title"
              placeholder="e.g., AI & Technology Boom"
              value={trendForm.title}
              onChange={(e) => setTrendForm({ ...trendForm, title: e.target.value })}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trend-description">Description *</Label>
            <Textarea
              id="trend-description"
              placeholder="Describe the market trend..."
              value={trendForm.description}
              onChange={(e) => setTrendForm({ ...trendForm, description: e.target.value })}
              disabled={uploading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trend-impact">Impact Level *</Label>
              <Select
                value={trendForm.impact}
                onValueChange={(value) => setTrendForm({ ...trendForm, impact: value })}
                disabled={uploading}
              >
                <SelectTrigger id="trend-impact">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trend-timeframe">Timeframe *</Label>
              <Input
                id="trend-timeframe"
                placeholder="e.g., 2024-2025"
                value={trendForm.timeframe}
                onChange={(e) => setTrendForm({ ...trendForm, timeframe: e.target.value })}
                disabled={uploading}
              />
            </div>
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Market Trend"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
