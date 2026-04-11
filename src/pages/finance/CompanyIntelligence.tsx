import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Building2, Users, TrendingUp, Globe, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Briefcase, Target, BarChart3, ExternalLink,
  ChevronRight, Filter, Download, Loader2
} from "lucide-react";

interface CompanyData {
  id: string;
  company_name: string;
  ticker: string | null;
  sector: string | null;
  industry: string | null;
  location: string | null;
  country: string | null;
  revenue_estimate: number | null;
  revenue_currency: string | null;
  employee_count: number | null;
  ownership_type: string | null;
  fundraising_history: any[];
  competitors: string[];
  funding_rounds: any[];
  ma_transactions: any[];
  valuations: any[];
  exits: any[];
  founded_year: number | null;
  website: string | null;
  description: string | null;
  status: string | null;
  logo_url: string | null;
  created_at: string;
}

const sectorOptions = ["Technology", "Financial Services", "Healthcare", "Real Estate", "Energy", "Consumer", "Industrial", "Media", "Telecoms", "Other"];
const ownershipOptions = ["private", "public", "pe_backed", "vc_backed", "family_owned"];

const formatCurrency = (val: number | null, currency: string = "GBP") => {
  if (val == null) return "—";
  if (val >= 1e9) return `£${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `£${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `£${(val / 1e3).toFixed(0)}K`;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);
};

export default function CompanyIntelligence() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("company_intelligence")
      .select("*")
      .eq("status", "active")
      .order("company_name");
    if (error) { toast.error("Failed to load companies"); console.error(error); }
    else setCompanies((data as CompanyData[]) || []);
    setLoading(false);
  };

  const filtered = useMemo(() => companies.filter(c => {
    if (searchQuery && !c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.sector?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.industry?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
    if (ownershipFilter !== "all" && c.ownership_type !== ownershipFilter) return false;
    return true;
  }), [companies, searchQuery, sectorFilter, ownershipFilter]);

  const CompanyDetailDialog = ({ company }: { company: CompanyData }) => (
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-2xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          {company.company_name}
          {company.ticker && <Badge variant="outline" className="text-xs">{company.ticker}</Badge>}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="ma">M&A</TabsTrigger>
            <TabsTrigger value="valuations">Valuations</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <p className="text-muted-foreground">{company.description || "No description available."}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-4 text-center">
                <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Revenue Est.</p>
                <p className="font-bold text-lg">{formatCurrency(company.revenue_estimate)}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="font-bold text-lg">{company.employee_count?.toLocaleString() || "—"}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Calendar className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="font-bold text-lg">{company.founded_year || "—"}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Globe className="h-5 w-5 mx-auto text-violet-500 mb-1" />
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-bold text-lg text-sm">{company.location || "—"}</p>
              </CardContent></Card>
            </div>
            <div className="flex gap-2 flex-wrap">
              {company.sector && <Badge>{company.sector}</Badge>}
              {company.industry && <Badge variant="outline">{company.industry}</Badge>}
              <Badge variant="secondary" className="capitalize">{company.ownership_type?.replace("_", " ") || "Private"}</Badge>
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm hover:underline">
                <ExternalLink className="h-3 w-3" /> {company.website}
              </a>
            )}
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            <h3 className="font-semibold text-lg">Historic Funding Rounds</h3>
            {company.funding_rounds && company.funding_rounds.length > 0 ? (
              <div className="space-y-3">
                {company.funding_rounds.map((round: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div>
                        <p className="font-medium">{round.round_type || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{round.date || "Date N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{round.amount ? formatCurrency(round.amount) : "Undisclosed"}</p>
                        <p className="text-xs text-muted-foreground">{round.lead_investor || ""}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No funding rounds recorded.</p>}

            <Separator />
            <h3 className="font-semibold text-lg">Fundraising History</h3>
            {company.fundraising_history && company.fundraising_history.length > 0 ? (
              <div className="space-y-2">
                {company.fundraising_history.map((h: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm">{h.event || "Event"}</span>
                    <span className="text-sm font-medium">{h.amount ? formatCurrency(h.amount) : h.detail || "—"}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No fundraising history.</p>}
          </TabsContent>

          <TabsContent value="ma" className="space-y-4">
            <h3 className="font-semibold text-lg">M&A Transactions & Exits</h3>
            {company.ma_transactions && company.ma_transactions.length > 0 ? (
              <div className="space-y-3">
                {company.ma_transactions.map((tx: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="py-3 px-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{tx.type || "Transaction"}</p>
                          <p className="text-xs text-muted-foreground">{tx.counterparty || ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{tx.value ? formatCurrency(tx.value) : "Undisclosed"}</p>
                          <p className="text-xs text-muted-foreground">{tx.date || ""}</p>
                        </div>
                      </div>
                      {tx.multiple && <Badge variant="outline" className="mt-2">EV/Revenue: {tx.multiple}x</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No M&A transactions recorded.</p>}

            <Separator />
            <h3 className="font-semibold text-lg">Exits</h3>
            {company.exits && company.exits.length > 0 ? (
              <div className="space-y-2">
                {company.exits.map((exit: any, i: number) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-sm font-medium">{exit.type || "Exit"}</span>
                    <span className="text-sm">{exit.value ? formatCurrency(exit.value) : "Undisclosed"} — {exit.date || ""}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No exits recorded.</p>}
          </TabsContent>

          <TabsContent value="valuations" className="space-y-4">
            <h3 className="font-semibold text-lg">Valuations & Multiples</h3>
            {company.valuations && company.valuations.length > 0 ? (
              <div className="space-y-3">
                {company.valuations.map((v: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div>
                        <p className="font-medium">{v.type || "Valuation"}</p>
                        <p className="text-xs text-muted-foreground">{v.date || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{v.value ? formatCurrency(v.value) : "—"}</p>
                        {v.ev_revenue && <Badge variant="outline" className="text-xs">EV/Rev: {v.ev_revenue}x</Badge>}
                        {v.ev_ebitda && <Badge variant="outline" className="text-xs ml-1">EV/EBITDA: {v.ev_ebitda}x</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No valuations recorded.</p>}
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <h3 className="font-semibold text-lg">Key Competitors</h3>
            {company.competitors && company.competitors.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {company.competitors.map((comp, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-2 py-3 px-4">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{comp}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No competitors listed.</p>}
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
            <Building2 className="h-8 w-8 text-primary" />
            Company Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">PitchBook-grade company data: revenue, funding, M&A, valuations & competitors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies, sectors, industries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectorOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Ownership" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ownership</SelectItem>
            {ownershipOptions.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">Companies</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-emerald-500" />
          <div><p className="text-2xl font-bold">{formatCurrency(filtered.reduce((sum, c) => sum + (c.revenue_estimate || 0), 0))}</p><p className="text-xs text-muted-foreground">Total Revenue</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          <div><p className="text-2xl font-bold">{filtered.reduce((sum, c) => sum + (c.employee_count || 0), 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Employees</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-violet-500" />
          <div><p className="text-2xl font-bold">{new Set(filtered.map(c => c.sector).filter(Boolean)).size}</p><p className="text-xs text-muted-foreground">Sectors</p></div>
        </CardContent></Card>
      </div>

      {/* Company List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No Companies Found</h3>
          <p className="text-muted-foreground">{searchQuery ? "Try adjusting your search" : "Companies will appear here when added by admin."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(company => (
            <Dialog key={company.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{company.company_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-0.5">
                            {company.sector && <Badge variant="outline" className="text-xs">{company.sector}</Badge>}
                            {company.ticker && <span className="text-xs text-muted-foreground">{company.ticker}</span>}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{company.description || "No description"}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(company.revenue_estimate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Employees</p>
                        <p className="text-sm font-bold">{company.employee_count?.toLocaleString() || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Founded</p>
                        <p className="text-sm font-bold">{company.founded_year || "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs capitalize">{company.ownership_type?.replace("_", " ") || "Private"}</Badge>
                      {company.country && <Badge variant="outline" className="text-xs">{company.country}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <CompanyDetailDialog company={company} />
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
