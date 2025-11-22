import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Video, 
  TrendingUp, 
  AlertCircle, 
  Receipt, 
  Search,
  BookMarked,
  PlayCircle,
  Factory,
  ShieldAlert,
  Briefcase,
  Library,
  CheckCircle,
  Loader2,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LearningHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [guides, setGuides] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [taxGuides, setTaxGuides] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);

  useEffect(() => {
    fetchLearningContent();
  }, []);

  const fetchLearningContent = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("learning_content")
        .select("*")
        .eq("is_published", true)
        .or(`uploaded_by.is.null,uploaded_by.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setGuides(data.filter(item => item.category === "guides"));
        setSectors(data.filter(item => item.category === "sectors"));
        setRisks(data.filter(item => item.category === "risks"));
        setTaxGuides(data.filter(item => item.category === "tax"));
        setVideos(data.filter(item => item.category === "videos"));
        setGlossary(data.filter(item => item.category === "glossary"));
      }
    } catch (error: any) {
      console.error("Error fetching learning content:", error);
      toast.error("Failed to load learning content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContent = async (content: any) => {
    setSelectedContent(content);
    setContentDialogOpen(true);

    // Track user progress
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("learning_progress")
          .upsert({
            user_id: user.id,
            content_id: content.id,
            last_accessed_at: new Date().toISOString()
          }, {
            onConflict: "user_id,content_id"
          });
      }

      // Increment view count
      await supabase
        .from("learning_content")
        .update({ view_count: content.view_count + 1 })
        .eq("id", content.id);
    } catch (error) {
      console.error("Error tracking content view:", error);
    }
  };

  const markAsCompleted = async (contentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to track your progress");
        return;
      }

      await supabase
        .from("learning_progress")
        .upsert({
          user_id: user.id,
          content_id: contentId,
          completed: true,
          progress_percentage: 100,
          completed_at: new Date().toISOString()
        }, {
          onConflict: "user_id,content_id"
        });

      toast.success("Marked as completed!");
      setContentDialogOpen(false);
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error("Failed to update progress");
    }
  };

  const filteredGlossary = glossary.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading learning content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Hub</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive educational resources to help you become a confident investor
        </p>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guides</span>
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Sectors</span>
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Risks</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Glossary</span>
          </TabsTrigger>
        </TabsList>

        {/* Beginner Guides */}
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-blue-500" />
                Investment Guides
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Essential reading for investors to build knowledge
              </p>
            </CardHeader>
            <CardContent>
              {guides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No guides available yet</p>
                  <p className="text-sm mt-1">Check back soon for educational content</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {guides.map((guide) => (
                    <Card key={guide.id} className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewContent(guide)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {guide.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {guide.duration}
                          </div>
                        )}
                        {guide.topics && guide.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {guide.topics.map((topic: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button className="w-full" variant="outline">
                          Read Guide
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sector Explainers */}
        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-purple-500" />
                Sector Explainers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understand different market sectors and their characteristics
              </p>
            </CardHeader>
            <CardContent>
              {sectors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Factory className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No sector guides available yet</p>
                  <p className="text-sm mt-1">Check back soon for sector analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sectors.map((sector) => (
                    <Card key={sector.id} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewContent(sector)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{sector.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{sector.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sector.key_metrics && sector.key_metrics.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Key Metrics:</p>
                            <div className="flex flex-wrap gap-2">
                              {sector.key_metrics.map((metric: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {sector.major_players && sector.major_players.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Major Players:</p>
                            <div className="flex flex-wrap gap-2">
                              {sector.major_players.map((player: string, idx: number) => (
                                <Badge key={idx}>
                                  {player}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Disclosures */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                Risk Disclosures
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding the risks involved in investing
              </p>
            </CardHeader>
            <CardContent>
              {risks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No risk disclosures available yet</p>
                  <p className="text-sm mt-1">Check back soon for risk information</p>
                </div>
              ) : (
                <>
                  <Accordion type="single" collapsible className="w-full">
                    {risks.map((risk, index) => (
                      <AccordionItem key={risk.id} value={`risk-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">{risk.title}</span>
                            {risk.severity && (
                              <Badge
                                variant={
                                  risk.severity.includes("High")
                                    ? "destructive"
                                    : risk.severity.includes("Medium")
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {risk.severity}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div>
                              <p className="text-sm font-semibold mb-1">What it means:</p>
                              <p className="text-sm text-muted-foreground">{risk.description}</p>
                            </div>
                            {risk.mitigation && (
                              <div>
                                <p className="text-sm font-semibold mb-1">How to mitigate:</p>
                                <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Important Notice</p>
                        <p className="text-sm text-muted-foreground">
                          All investments carry risk. The value of investments can go down as well as up,
                          and you may get back less than you invested. Past performance is not a guide to
                          future performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Basics */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-500" />
                Tax Guidance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding tax-efficient investing
              </p>
            </CardHeader>
            <CardContent>
              {taxGuides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tax guides available yet</p>
                  <p className="text-sm mt-1">Check back soon for tax information</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {taxGuides.map((guide) => (
                      <Card key={guide.id} className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewContent(guide)}>
                        <CardHeader>
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{guide.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guide.content}</p>
                          </div>
                          <Button variant="outline" className="w-full">
                            Read Full Guide
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex gap-3">
                      <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Professional Advice</p>
                        <p className="text-sm text-muted-foreground">
                          Tax rules can be complex and change regularly. Consider consulting a qualified
                          financial advisor or tax professional for personalized guidance.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Explainers */}
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-red-500" />
                Video Explainers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Visual learning resources to master investment concepts
              </p>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No videos available yet</p>
                  <p className="text-sm mt-1">Check back soon for video content</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewContent(video)}>
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="aspect-video object-cover" />
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <PlayCircle className="h-16 w-16 text-primary" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{video.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          {video.duration && <span>{video.duration}</span>}
                          <span>{video.view_count || 0} views</span>
                        </div>
                        {video.difficulty_level && (
                          <Badge variant="outline">{video.difficulty_level}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5 text-indigo-500" />
                Investment Glossary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick reference for common investment terms and definitions
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {glossary.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Library className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No glossary terms available yet</p>
                  <p className="text-sm mt-1">Check back soon for definitions</p>
                </div>
              ) : (
                <>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredGlossary.map((item, index) => (
                      <AccordionItem key={item.id} value={`term-${index}`}>
                        <AccordionTrigger className="text-left font-semibold">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {filteredGlossary.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No terms found matching "{searchTerm}"</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Detail Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>{selectedContent?.description}</DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedContent.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              ) : selectedContent.file_path ? (
                <div className="p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    Document attached
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={selectedContent.file_path} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              ) : null}
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedContent.content}</p>
              </div>

              {selectedContent.topics && selectedContent.topics.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.topics.map((topic: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => markAsCompleted(selectedContent.id)} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
