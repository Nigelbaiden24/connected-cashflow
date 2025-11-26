import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Search, Calendar, Eye, Sparkles, TrendingUp, Newspaper, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Newsletter {
  id: string;
  title: string;
  edition: string | null;
  preview: string | null;
  content: string;
  read_time: string | null;
  category: string;
  published_date: string | null;
  file_path: string | null;
}

const Newsletters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [aiRoundup, setAiRoundup] = useState<string>("");
  const [loadingAiRoundup, setLoadingAiRoundup] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  
  const [weeklyRoundups, setWeeklyRoundups] = useState<Newsletter[]>([]);
  const [sectorNewsletters, setSectorNewsletters] = useState<Newsletter[]>([]);
  const [storyDigests, setStoryDigests] = useState<Newsletter[]>([]);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setWeeklyRoundups(data.filter(n => n.category === 'ai_roundup'));
        setSectorNewsletters(data.filter(n => n.category === 'sector' || n.category === 'admin_upload'));
        setStoryDigests(data.filter(n => n.category === 'digest'));
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast.error('Failed to load newsletters');
    }
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully subscribed to newsletters!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleReadMore = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
  };

  const handleReadFullRoadmap = async () => {
    setLoadingAiRoundup(true);
    setShowAiDialog(true);
    setAiRoundup('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-roundup');

      if (error) throw error;

      setAiRoundup(data.content);
    } catch (error) {
      console.error('Error generating AI roundup:', error);
      setAiRoundup('Unable to generate AI roundup at this time. Please try again later.');
      toast.error('Failed to generate AI roundup');
    } finally {
      setLoadingAiRoundup(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
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
          
          {weeklyRoundups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No AI roundups available yet
              </CardContent>
            </Card>
          ) : (
            weeklyRoundups.map((newsletter) => (
              <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-8 w-8 text-primary" />
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        AI Generated
                      </Badge>
                    </div>
                    <Badge>{newsletter.read_time}</Badge>
                  </div>
                  <CardTitle className="mt-4">{newsletter.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {newsletter.edition}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{newsletter.preview}</p>
                  <Button onClick={handleReadFullRoadmap} variant="outline" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Read Full Roadmap
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
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
            {sectorNewsletters.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No sector newsletters available yet
                </CardContent>
              </Card>
            ) : (
              sectorNewsletters.map((newsletter) => (
                <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{newsletter.category}</Badge>
                      <Badge variant="secondary">{newsletter.read_time}</Badge>
                    </div>
                    <CardTitle className="mt-4">{newsletter.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {newsletter.edition}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{newsletter.preview}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReadMore(newsletter)}
                    >
                      Read More →
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
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

          {storyDigests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No story digests available yet
              </CardContent>
            </Card>
          ) : (
            storyDigests.map((digest) => (
              <Card key={digest.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{digest.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {digest.edition}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {digest.read_time}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{digest.preview}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleReadMore(digest)}
                  >
                    Read Full Digest →
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Newsletter Detail Dialog */}
      <Dialog open={!!selectedNewsletter} onOpenChange={() => setSelectedNewsletter(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedNewsletter?.title}</DialogTitle>
            <p className="text-muted-foreground">{selectedNewsletter?.edition}</p>
          </DialogHeader>
          {selectedNewsletter?.file_path ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={`https://wlsmdcdfyudtvbnbqfmn.supabase.co/storage/v1/object/public/newsletters/${selectedNewsletter.file_path}`}
                className="w-full h-full border rounded-lg"
                title={selectedNewsletter.title}
              />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: selectedNewsletter?.content || '' }}
                className="whitespace-pre-wrap"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Roadmap Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI-Generated Weekly Market Roadmap
            </DialogTitle>
          </DialogHeader>
          {loadingAiRoundup ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating comprehensive market analysis...</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{aiRoundup}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Newsletters;