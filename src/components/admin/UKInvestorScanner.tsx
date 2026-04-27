import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveScrapeResult } from "@/hooks/useScrapeAutoSave";
import {
  Search, Loader2, Globe, Users, TrendingUp, Handshake, Download, Filter,
  ExternalLink, Mail, Phone, Linkedin, MapPin, Building2, Briefcase,
  Coins, Target, Eye, Copy
} from "lucide-react";

interface TeamMember { name?: string; title?: string; email?: string; phone?: string; linkedin?: string }
interface RecentInvestment { company?: string; round?: string; amount?: string; date?: string }

interface InvestorRecord {
  source_url: string;
  source_title?: string | null;
  source_snippet?: string | null;
  firm_name?: string | null;
  firm_type?: string | null;
  website?: string | null;
  headquarters?: string | null;
  address?: string | null;
  founded?: string | null;
  aum?: string | null;
  fund_size?: string | null;
  cheque_size?: string | null;
  stages?: string[];
  sectors?: string[];
  geographies?: string[];
  thesis?: string | null;
  team?: TeamMember[];
  general_emails?: string[];
  general_phones?: string[];
  linkedin?: string | null;
  twitter?: string | null;
  all_linkedin_profiles?: string[];
  portfolio_companies?: string[];
  recent_investments?: RecentInvestment[];
  notable_exits?: string[];
  enriched_at?: string;
}

const SCAN_CATEGORIES = [
  { id: "investors", label: "UK Investors", icon: Users, description: "Active UK-based investors with full contact details (Apollo-style)" },
  { id: "funding", label: "Funding Rounds", icon: TrendingUp, description: "Recent UK funding rounds with deal participants" },
  { id: "buyouts", label: "Company Buyouts", icon: Handshake, description: "M&A activity, buyouts and acquisitions in the UK" },
];

const INVESTOR_TYPES = ["All", "VC", "Angel", "Angel Network", "PE", "Family Office", "Corporate VC", "Accelerator"];
const STAGES = ["All", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Buyout"];
const SECTORS = ["All", "Fintech", "Wealthtech", "SaaS", "HealthTech", "EdTech", "PropTech", "CleanTech", "AI/ML", "Cybersecurity", "E-commerce", "Deep Tech", "Climate"];
const REGIONS = ["UK", "London", "Europe", "USA", "Global"];

export function UKInvestorScanner() {
  const [activeCategory, setActiveCategory] = useState("investors");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<InvestorRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [investorType, setInvestorType] = useState("All");
  const [stage, setStage] = useState("All");
  const [sector, setSector] = useState("All");
  const [region, setRegion] = useState("UK");
  const [chequeMin, setChequeMin] = useState("");
  const [chequeMax, setChequeMax] = useState("");
  const [selected, setSelected] = useState<InvestorRecord | null>(null);

  const runScan = async () => {
    setScanning(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("investor-finder-scraper", {
        body: {
          category: activeCategory,
          query: searchQuery.trim(),
          investorType,
          stage,
          sector,
          region,
          maxResults: 14,
        },
      });
      if (error) throw error;
      const parsed: InvestorRecord[] = Array.isArray(data?.results) ? data.results : [];
      setResults(parsed);
      toast.success(`Enriched ${parsed.length} ${activeCategory} records`);
      saveScrapeResult({
        source: "uk-investors",
        title: `Investor Finder — ${activeCategory}${searchQuery ? ` — ${searchQuery}` : ""}`,
        category: activeCategory,
        customQuery: searchQuery || null,
        subCategory: `${investorType}/${stage}/${sector}/${region}`,
        payload: { raw: data, parsed },
        opportunities: parsed,
        opportunitiesCount: parsed.length,
      });
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const exportCSV = () => {
    if (results.length === 0) return;
    const headers = ["Firm","Type","HQ","AUM","Fund Size","Cheque","Stages","Sectors","Emails","Phones","LinkedIn","Website","Source"];
    const rows = results.map(r => [
      r.firm_name ?? "",
      r.firm_type ?? "",
      r.headquarters ?? r.address ?? "",
      r.aum ?? "",
      r.fund_size ?? "",
      r.cheque_size ?? "",
      (r.stages ?? []).join("; "),
      (r.sectors ?? []).join("; "),
      (r.general_emails ?? []).join("; "),
      (r.general_phones ?? []).join("; "),
      r.linkedin ?? "",
      r.website ?? "",
      r.source_url,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowpulse-investor-finder-${activeCategory}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const copy = (val?: string | null) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    toast.success("Copied");
  };

  const filtered = results.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.firm_name ?? "").toLowerCase().includes(q) ||
      (r.thesis ?? "").toLowerCase().includes(q) ||
      (r.sectors ?? []).join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Investor Finder — Apollo-Grade Enrichment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scrape live web sources for investors, funds and deals. Auto-enriches with phones, emails, partners, AUM, sectors and portfolio.
          </p>
        </div>
        {results.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {SCAN_CATEGORIES.map(cat => (
          <Card
            key={cat.id}
            className={`cursor-pointer transition-all hover:shadow-md ${activeCategory === cat.id ? "border-primary bg-primary/5 shadow-md" : "border-border/50"}`}
            onClick={() => { setActiveCategory(cat.id); setResults([]); }}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${activeCategory === cat.id ? "bg-primary/10" : "bg-muted"}`}>
                <cat.icon className={`h-5 w-5 ${activeCategory === cat.id ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Search Filters
          </CardTitle>
          <CardDescription className="text-xs">
            Tip: add a firm name, sector keyword, or partner name in the search box for laser-targeted results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <Input
                placeholder={`Search ${activeCategory}... (e.g. "fintech seed London")`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={investorType} onValueChange={setInvestorType}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Investor Type" /></SelectTrigger>
              <SelectContent>{INVESTOR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>{SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Min cheque (£)" value={chequeMin} onChange={e => setChequeMin(e.target.value)} className="h-9" />
            <Input placeholder="Max cheque (£)" value={chequeMax} onChange={e => setChequeMax(e.target.value)} className="h-9" />
            <Button onClick={runScan} disabled={scanning} className="h-9 gap-1.5">
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scanning ? "Enriching..." : "Run Apollo Scan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {scanning && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Apollo-grade enrichment in progress…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Searching the web, scraping firm pages, and extracting partners, emails, phones, AUM and portfolio data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{filtered.length} Enriched Records</CardTitle>
              <Badge variant="outline">{activeCategory}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">Firm</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>HQ</TableHead>
                    <TableHead>AUM / Fund</TableHead>
                    <TableHead>Cheque</TableHead>
                    <TableHead>Sectors</TableHead>
                    <TableHead className="min-w-[160px]">Contacts</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, i) => (
                    <TableRow key={`${r.source_url}-${i}`} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelected(r)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{r.firm_name ?? r.source_title ?? "Unnamed"}</p>
                          {r.thesis && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.thesis}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.firm_type ?? "—"}</Badge></TableCell>
                      <TableCell className="text-xs">{r.headquarters ?? r.address ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        {r.aum && <div className="font-semibold">{r.aum}</div>}
                        {r.fund_size && <div className="text-muted-foreground">{r.fund_size}</div>}
                        {!r.aum && !r.fund_size && "—"}
                      </TableCell>
                      <TableCell className="text-xs">{r.cheque_size ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex gap-1 flex-wrap">
                          {(r.sectors ?? []).slice(0, 3).map(s => (
                            <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          {(r.general_emails?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-emerald-600"><Mail className="h-3 w-3" />{r.general_emails!.length}</span>
                          )}
                          {(r.general_phones?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-blue-600"><Phone className="h-3 w-3" />{r.general_phones!.length}</span>
                          )}
                          {r.linkedin && (
                            <span className="flex items-center gap-1 text-sky-600"><Linkedin className="h-3 w-3" /></span>
                          )}
                          {(r.team?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-violet-600"><Users className="h-3 w-3" />{r.team!.length}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Apollo-style detail panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selected.firm_name ?? selected.source_title ?? "Investor"}
                </SheetTitle>
                <SheetDescription>
                  {selected.firm_type && <Badge variant="outline" className="mr-2">{selected.firm_type}</Badge>}
                  {selected.headquarters && <span className="inline-flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" />{selected.headquarters}</span>}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 mt-5">
                {selected.thesis && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Thesis</p>
                    <p className="text-sm">{selected.thesis}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {selected.aum && <Stat icon={Coins} label="AUM" value={selected.aum} />}
                  {selected.fund_size && <Stat icon={Briefcase} label="Fund Size" value={selected.fund_size} />}
                  {selected.cheque_size && <Stat icon={Target} label="Cheque" value={selected.cheque_size} />}
                  {selected.founded && <Stat icon={Building2} label="Founded" value={selected.founded} />}
                </div>

                {((selected.stages?.length ?? 0) > 0 || (selected.sectors?.length ?? 0) > 0) && (
                  <div className="space-y-2">
                    {(selected.stages?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Stages</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.stages!.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                    {(selected.sectors?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Sectors</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.sectors!.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Contacts */}
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" />General Contact</p>
                  <div className="space-y-1.5">
                    {(selected.general_emails ?? []).map(e => (
                      <div key={e} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2 py-1">
                        <a href={`mailto:${e}`} className="text-emerald-700 hover:underline">{e}</a>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(e)}><Copy className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    {(selected.general_phones ?? []).map(p => (
                      <div key={p} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2 py-1">
                        <a href={`tel:${p.replace(/\s/g, "")}`} className="text-blue-700 hover:underline flex items-center gap-1.5"><Phone className="h-3 w-3" />{p}</a>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(p)}><Copy className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    {selected.linkedin && (
                      <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-sky-700 hover:underline bg-muted/40 rounded px-2 py-1">
                        <Linkedin className="h-3 w-3" /> {selected.linkedin}
                      </a>
                    )}
                    {selected.website && (
                      <a href={selected.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline bg-muted/40 rounded px-2 py-1">
                        <Globe className="h-3 w-3" /> {selected.website}
                      </a>
                    )}
                    {selected.address && (
                      <div className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                        <MapPin className="h-3 w-3" /> {selected.address}
                      </div>
                    )}
                    {(selected.general_emails?.length ?? 0) === 0 && (selected.general_phones?.length ?? 0) === 0 && (
                      <p className="text-xs text-muted-foreground italic">No public contact details extracted from this source.</p>
                    )}
                  </div>
                </div>

                {/* Team */}
                {(selected.team?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-violet-600" />Team & Partners</p>
                    <div className="space-y-2">
                      {selected.team!.map((m, idx) => (
                        <div key={idx} className="border border-border/50 rounded-lg p-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{m.name ?? "Unnamed"}</p>
                            {m.title && <Badge variant="outline" className="text-[10px]">{m.title}</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {m.email && <a href={`mailto:${m.email}`} className="text-emerald-700 hover:underline flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</a>}
                            {m.phone && <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="text-blue-700 hover:underline flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</a>}
                            {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline flex items-center gap-1"><Linkedin className="h-3 w-3" />Profile</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LinkedIn profiles harvested from page */}
                {(selected.all_linkedin_profiles?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Linkedin className="h-4 w-4 text-sky-600" />LinkedIn Profiles Found</p>
                    <div className="space-y-1">
                      {selected.all_linkedin_profiles!.map(l => (
                        <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="block text-xs text-sky-700 hover:underline truncate">{l}</a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {(selected.portfolio_companies?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Portfolio Companies</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.portfolio_companies!.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Recent Investments */}
                {(selected.recent_investments?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recent Investments</p>
                    <div className="space-y-1.5">
                      {selected.recent_investments!.map((inv, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2 py-1">
                          <span className="font-medium">{inv.company}</span>
                          <span className="text-muted-foreground">{[inv.round, inv.amount, inv.date].filter(Boolean).join(" · ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />
                <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View original source
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-border/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
