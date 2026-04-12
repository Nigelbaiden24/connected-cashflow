import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Rocket, Users, TrendingUp, Globe, DollarSign, Calendar,
  Target, BarChart3, ExternalLink, ChevronRight, Download, Loader2,
  Zap, UserPlus, Star, Filter, ListChecks, Award, Briefcase
} from "lucide-react";

interface StartupData {
  id: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  founders: string[];
  location: string | null;
  country: string | null;
  funding_total: number | null;
  funding_currency: string | null;
  headcount: number | null;
  founding_year: number | null;
  crowdfunding_platform: string | null;
  campaign_url: string | null;
  lead_score: number | null;
  growth_indicators: any;
  buyer_signals: any;
  pitch_deck_url: string | null;
  website: string | null;
  description: string | null;
  status: string | null;
  logo_url: string | null;
  prospect_tags: string[];
  last_funding_date: string | null;
  funding_stage: string | null;
  created_at: string;
}

const platformOptions = ["Seedrs", "Crowdcube", "Republic", "Wefunder", "StartEngine", "Other"];
const stageOptions = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth", "Pre-IPO"];
const sectorOptions = ["Fintech", "SaaS", "HealthTech", "EdTech", "CleanTech", "PropTech", "AI/ML", "Consumer", "B2B", "Other"];

const formatCurrency = (val: number | null) => {
  if (val == null) return "—";
  if (val >= 1e6) return `£${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `£${(val / 1e3).toFixed(0)}K`;
  return `£${val.toLocaleString()}`;
};

const getLeadScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
};

export default function StartupDiscovery() {
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [listMode, setListMode] = useState(false);

  useEffect(() => { fetchStartups(); }, []);

  const fetchStartups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("startup_discovery")
      .select("*")
      .eq("status", "active")
      .order("lead_score", { ascending: false });
    if (error) { toast.error("Failed to load startups"); console.error(error); }
    else setStartups((data as StartupData[]) || []);
    setLoading(false);
  };

  const filtered = useMemo(() => startups.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.company_name.toLowerCase().includes(q) &&
        !s.sector?.toLowerCase().includes(q) &&
        !s.industry?.toLowerCase().includes(q) &&
        !s.founders?.some(f => f.toLowerCase().includes(q)) &&
        !s.prospect_tags?.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (sectorFilter !== "all" && s.sector !== sectorFilter) return false;
    if (platformFilter !== "all" && s.crowdfunding_platform !== platformFilter) return false;
    if (stageFilter !== "all" && s.funding_stage !== stageFilter) return false;
    return true;
  }), [startups, searchQuery, sectorFilter, platformFilter, stageFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportProspectList = () => {
    const selected = startups.filter(s => selectedIds.includes(s.id));
    const csv = [
      "Company,Sector,Stage,Funding,Lead Score,Platform,Location,Website,Founders",
      ...selected.map(s =>
        `"${s.company_name}","${s.sector || ""}","${s.funding_stage || ""}","${s.funding_total || ""}","${s.lead_score || ""}","${s.crowdfunding_platform || ""}","${s.location || ""}","${s.website || ""}","${s.founders?.join("; ") || ""}"`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prospect-list.csv"; a.click();
    toast.success(`Exported ${selected.length} prospects`);
  };

  const StartupDetail = ({ startup }: { startup: StartupData }) => (
    <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-2xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          {startup.company_name}
          {startup.crowdfunding_platform && <Badge className="bg-violet-500/10 text-violet-600">{startup.crowdfunding_platform}</Badge>}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="founders">Founders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <p className="text-muted-foreground">{startup.description || "No description available."}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-4 text-center">
                <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Total Funding</p>
                <p className="font-bold">{formatCurrency(startup.funding_total)}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-muted-foreground">Headcount</p>
                <p className="font-bold">{startup.headcount || "—"}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                <p className="text-xs text-muted-foreground">Lead Score</p>
                <p className={`font-bold text-lg ${getLeadScoreColor(startup.lead_score || 0)}`}>{startup.lead_score || 0}/100</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Calendar className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="font-bold">{startup.founding_year || "—"}</p>
              </CardContent></Card>
            </div>
            <div className="flex gap-2 flex-wrap">
              {startup.sector && <Badge>{startup.sector}</Badge>}
              {startup.funding_stage && <Badge variant="outline">{startup.funding_stage}</Badge>}
              {startup.prospect_tags?.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
            </div>
            <div className="flex gap-3">
              {startup.website && <a href={startup.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm hover:underline"><ExternalLink className="h-3 w-3" /> Website</a>}
              {startup.campaign_url && <a href={startup.campaign_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-violet-500 text-sm hover:underline"><ExternalLink className="h-3 w-3" /> Campaign</a>}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Buyer Signals</h3>
            {startup.buyer_signals && Object.keys(startup.buyer_signals).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(startup.buyer_signals).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm capitalize">{key.replace(/_/g, " ")}</span>
                    <Badge variant={val === true || (typeof val === "string" && val.toLowerCase() === "strong") ? "default" : "outline"}>
                      {String(val)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No buyer signals recorded.</p>}
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Growth Indicators</h3>
            {startup.growth_indicators && Object.keys(startup.growth_indicators).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(startup.growth_indicators).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-medium">{String(val)}</span>
                    </div>
                    {typeof val === "number" && <Progress value={Math.min(val, 100)} />}
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No growth indicators recorded.</p>}
          </TabsContent>

          <TabsContent value="founders" className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-500" /> Founding Team</h3>
            {startup.founders && startup.founders.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {startup.founders.map((f, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {f.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{f}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No founders listed.</p>}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </DialogContent>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Startup Discovery
          </h1>
          <p className="text-muted-foreground mt-1">Discover startups & private companies on crowdfunding platforms — lead scoring, buyer signals & prospect lists</p>
        </div>
        <div className="flex gap-2">
          <Button variant={listMode ? "default" : "outline"} size="sm" onClick={() => { setListMode(!listMode); if (listMode) setSelectedIds([]); }} className="gap-1.5">
            <ListChecks className="h-4 w-4" /> {listMode ? "Exit List Mode" : "Build Prospect List"}
          </Button>
          {selectedIds.length > 0 && (
            <Button size="sm" onClick={exportProspectList} className="gap-1.5">
              <Download className="h-4 w-4" /> Export ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* List mode banner */}
      {listMode && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Prospect List Mode</span>
            <span className="text-muted-foreground">— Click cards to select startups for your list</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
            {selectedIds.length > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={() => setSelectedIds([])} className="h-7 text-xs">Clear</Button>
                <Button size="sm" onClick={exportProspectList} className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" /> Export CSV
                </Button>
              </>
            )}
            {selectedIds.length === 0 && filtered.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setSelectedIds(filtered.map(s => s.id))} className="h-7 text-xs">Select All ({filtered.length})</Button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search startups, founders, tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectorOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platformOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stageOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Rocket className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">Startups</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-emerald-500" />
          <div><p className="text-2xl font-bold">{formatCurrency(filtered.reduce((s, c) => s + (c.funding_total || 0), 0))}</p><p className="text-xs text-muted-foreground">Total Funding</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Star className="h-8 w-8 text-amber-500" />
          <div><p className="text-2xl font-bold">{filtered.filter(s => (s.lead_score || 0) >= 70).length}</p><p className="text-xs text-muted-foreground">Hot Leads (70+)</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Award className="h-8 w-8 text-violet-500" />
          <div><p className="text-2xl font-bold">{new Set(filtered.map(s => s.crowdfunding_platform).filter(Boolean)).size}</p><p className="text-xs text-muted-foreground">Platforms</p></div>
        </CardContent></Card>
      </div>

      {/* Startup Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Rocket className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No Startups Found</h3>
          <p className="text-muted-foreground">{searchQuery ? "Try adjusting your filters" : "Startups will appear here when added by admin."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(startup => (
            <Dialog key={startup.id}>
              <div className="relative">
                {listMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedIds.includes(startup.id)}
                      onCheckedChange={() => toggleSelect(startup.id)}
                    />
                  </div>
                )}
                <DialogTrigger asChild>
                  <Card className={`cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group ${selectedIds.includes(startup.id) ? "ring-2 ring-primary/50" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`flex items-center gap-3 ${listMode ? "ml-8" : ""}`}>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Rocket className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{startup.company_name}</CardTitle>
                            <div className="flex items-center gap-2 mt-0.5">
                              {startup.crowdfunding_platform && <Badge className="text-xs bg-violet-500/10 text-violet-600 border-violet-200">{startup.crowdfunding_platform}</Badge>}
                              {startup.funding_stage && <Badge variant="outline" className="text-xs">{startup.funding_stage}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-bold ${getLeadScoreColor(startup.lead_score || 0)}`}>
                            {startup.lead_score || 0}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{startup.description || "No description"}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Funding</p>
                          <p className="text-sm font-bold text-primary">{formatCurrency(startup.funding_total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Team</p>
                          <p className="text-sm font-bold">{startup.headcount || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Founded</p>
                          <p className="text-sm font-bold">{startup.founding_year || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {startup.sector && <Badge variant="secondary" className="text-xs">{startup.sector}</Badge>}
                        {startup.prospect_tags?.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
              </div>
              <StartupDetail startup={startup} />
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
