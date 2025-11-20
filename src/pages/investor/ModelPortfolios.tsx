import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

const ModelPortfolios = () => {
  const [portfolios, setPortfolios] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('model_portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error('Failed to load model portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPortfolio = async (portfolio: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('portfolios')
        .createSignedUrl(portfolio.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error accessing portfolio:', error);
      toast.error('Failed to open portfolio. Please ensure you have access to this report.');
    }
  };

  const handleDownloadPortfolio = async (portfolio: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('portfolios')
        .download(portfolio.file_path);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolio.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Portfolio downloaded successfully');
    } catch (error) {
      console.error('Error downloading portfolio:', error);
      toast.error('Failed to download portfolio');
    }
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Thematic investment strategies for modern investors
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Briefcase className="h-8 w-8 text-primary" />
                <Badge variant="secondary">Model Portfolio</Badge>
              </div>
              <CardTitle className="mt-4">{portfolio.title}</CardTitle>
              {portfolio.description && (
                <CardDescription className="line-clamp-2">
                  {portfolio.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => handleViewPortfolio(portfolio)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDownloadPortfolio(portfolio)}
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModelPortfolios;
