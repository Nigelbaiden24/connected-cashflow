import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  Database, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Loader2, 
  Download,
  ExternalLink,
  Info,
  Star,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fund {
  isin: string;
  name: string;
  type: "ETF" | "Mutual Fund" | "Index Fund";
  category: string;
  currency: string;
  ter: number;
  aum: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  riskRating: number;
  provider: string;
  domicile: string;
  replicationMethod?: string;
  distributionPolicy?: string;
}

// Sample data
const sampleFunds: Fund[] = [
  { isin: "IE00B4L5Y983", name: "iShares Core MSCI World UCITS ETF", type: "ETF", category: "Global Equity", currency: "USD", ter: 0.20, aum: 52000, ytdReturn: 18.5, oneYearReturn: 22.3, threeYearReturn: 12.4, fiveYearReturn: 14.2, riskRating: 5, provider: "iShares", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Accumulating" },
  { isin: "IE00B3XXRP09", name: "Vanguard S&P 500 UCITS ETF", type: "ETF", category: "US Equity", currency: "USD", ter: 0.07, aum: 35000, ytdReturn: 22.1, oneYearReturn: 26.4, threeYearReturn: 14.8, fiveYearReturn: 16.1, riskRating: 5, provider: "Vanguard", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Distributing" },
  { isin: "IE00BZ163G84", name: "Vanguard FTSE 100 UCITS ETF", type: "ETF", category: "UK Equity", currency: "GBP", ter: 0.09, aum: 4500, ytdReturn: 8.2, oneYearReturn: 12.1, threeYearReturn: 6.3, fiveYearReturn: 7.8, riskRating: 5, provider: "Vanguard", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Distributing" },
  { isin: "IE00B4L5YC18", name: "iShares Core MSCI EM IMI UCITS ETF", type: "ETF", category: "Emerging Markets", currency: "USD", ter: 0.18, aum: 18000, ytdReturn: 5.2, oneYearReturn: 8.7, threeYearReturn: 2.1, fiveYearReturn: 5.4, riskRating: 6, provider: "iShares", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Accumulating" },
  { isin: "IE00B3F81R35", name: "iShares Core Euro Corp Bond UCITS ETF", type: "ETF", category: "Corporate Bonds", currency: "EUR", ter: 0.20, aum: 12000, ytdReturn: 4.8, oneYearReturn: 6.2, threeYearReturn: 1.5, fiveYearReturn: 2.1, riskRating: 3, provider: "iShares", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Distributing" },
  { isin: "LU0378449770", name: "Comgest Growth Europe", type: "Mutual Fund", category: "European Equity", currency: "EUR", ter: 1.58, aum: 8500, ytdReturn: 12.4, oneYearReturn: 15.8, threeYearReturn: 8.9, fiveYearReturn: 10.2, riskRating: 5, provider: "Comgest", domicile: "Luxembourg" },
  { isin: "GB00B3X7QG63", name: "Vanguard FTSE Developed World ex-UK", type: "Index Fund", category: "Global Equity", currency: "GBP", ter: 0.14, aum: 6200, ytdReturn: 19.8, oneYearReturn: 24.1, threeYearReturn: 13.2, fiveYearReturn: 15.0, riskRating: 5, provider: "Vanguard", domicile: "UK", distributionPolicy: "Accumulating" },
  { isin: "IE00B1XNHC34", name: "iShares Global Clean Energy UCITS ETF", type: "ETF", category: "Thematic", currency: "USD", ter: 0.65, aum: 4800, ytdReturn: -8.2, oneYearReturn: -5.4, threeYearReturn: 15.6, fiveYearReturn: 12.8, riskRating: 6, provider: "iShares", domicile: "Ireland", replicationMethod: "Physical", distributionPolicy: "Distributing" },
];

export default function FundETFDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isinLookup, setIsinLookup] = useState("");
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [filters, setFilters] = useState({ type: "all", category: "all", provider: "all" });
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<Fund | null>(null);
  const { toast } = useToast();

  const filteredFunds = sampleFunds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fund.isin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filters.type === "all" || fund.type === filters.type;
    const matchesCategory = filters.category === "all" || fund.category === filters.category;
    const matchesProvider = filters.provider === "all" || fund.provider === filters.provider;
    return matchesSearch && matchesType && matchesCategory && matchesProvider;
  });

  const handleIsinLookup = () => {
    if (!isinLookup.trim()) {
      toast({ title: "Error", description: "Please enter an ISIN", variant: "destructive" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const found = sampleFunds.find(f => f.isin.toUpperCase() === isinLookup.toUpperCase());
      if (found) {
        setLookupResult(found);
        toast({ title: "Found", description: `${found.name}` });
      } else {
        setLookupResult(null);
        toast({ title: "Not Found", description: "No fund found with that ISIN", variant: "destructive" });
      }
      setLoading(false);
    }, 500);
  };

  const categories = [...new Set(sampleFunds.map(f => f.category))];
  const providers = [...new Set(sampleFunds.map(f => f.provider))];

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "text-green-500";
    if (rating <= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getReturnColor = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Fund & ETF Database
        </h1>
        <p className="text-muted-foreground mt-2">Enterprise-grade fund research and analysis platform</p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search & Filter
          </TabsTrigger>
          <TabsTrigger value="isin" className="gap-2">
            <Globe className="h-4 w-4" />
            ISIN Lookup
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Data
          </TabsTrigger>
          <TabsTrigger value="factsheets" className="gap-2">
            <FileText className="h-4 w-4" />
            Factsheets
          </TabsTrigger>
        </TabsList>

        {/* Search & Filter Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Search
              </CardTitle>
              <CardDescription>Search and filter through our comprehensive fund database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by fund name or ISIN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-40">
                  <Label>Type</Label>
                  <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                      <SelectItem value="Index Fund">Index Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Label>Provider</Label>
                  <Select value={filters.provider} onValueChange={(v) => setFilters({ ...filters, provider: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>TER</TableHead>
                      <TableHead>1Y Return</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFunds.map((fund) => (
                      <TableRow key={fund.isin} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedFund(fund)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fund.name}</p>
                            <p className="text-xs text-muted-foreground">{fund.isin}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{fund.type}</Badge></TableCell>
                        <TableCell>{fund.category}</TableCell>
                        <TableCell>{fund.ter}%</TableCell>
                        <TableCell className={getReturnColor(fund.oneYearReturn)}>{fund.oneYearReturn}%</TableCell>
                        <TableCell className={getRiskColor(fund.riskRating)}>{fund.riskRating}/7</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <p className="text-sm text-muted-foreground">Showing {filteredFunds.length} of {sampleFunds.length} funds</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISIN Lookup Tab */}
        <TabsContent value="isin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                ISIN Lookup
              </CardTitle>
              <CardDescription>Quick lookup by International Securities Identification Number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="Enter ISIN (e.g., IE00B4L5Y983)"
                  value={isinLookup}
                  onChange={(e) => setIsinLookup(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button onClick={handleIsinLookup} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {lookupResult && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{lookupResult.name}</CardTitle>
                        <CardDescription className="font-mono">{lookupResult.isin}</CardDescription>
                      </div>
                      <Badge>{lookupResult.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{lookupResult.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Provider</p>
                        <p className="font-medium">{lookupResult.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Domicile</p>
                        <p className="font-medium">{lookupResult.domicile}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TER</p>
                        <p className="font-medium">{lookupResult.ter}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">AUM</p>
                        <p className="font-medium">${lookupResult.aum.toLocaleString()}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{lookupResult.currency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tables Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Tables
              </CardTitle>
              <CardDescription>Compare fund performance across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead className="text-right">YTD</TableHead>
                      <TableHead className="text-right">1 Year</TableHead>
                      <TableHead className="text-right">3 Year</TableHead>
                      <TableHead className="text-right">5 Year</TableHead>
                      <TableHead className="text-right">Risk Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleFunds.sort((a, b) => b.oneYearReturn - a.oneYearReturn).map((fund) => (
                      <TableRow key={fund.isin}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fund.name}</p>
                            <p className="text-xs text-muted-foreground">{fund.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${getReturnColor(fund.ytdReturn)}`}>{fund.ytdReturn}%</TableCell>
                        <TableCell className={`text-right ${getReturnColor(fund.oneYearReturn)}`}>{fund.oneYearReturn}%</TableCell>
                        <TableCell className={`text-right ${getReturnColor(fund.threeYearReturn)}`}>{fund.threeYearReturn}%</TableCell>
                        <TableCell className={`text-right ${getReturnColor(fund.fiveYearReturn)}`}>{fund.fiveYearReturn}%</TableCell>
                        <TableCell className={`text-right ${getRiskColor(fund.riskRating)}`}>{fund.riskRating}/7</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Data Tab */}
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Comparison
              </CardTitle>
              <CardDescription>Total Expense Ratios and fee analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">TER</TableHead>
                      <TableHead className="text-right">AUM (M)</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Cost Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleFunds.sort((a, b) => a.ter - b.ter).map((fund) => (
                      <TableRow key={fund.isin}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fund.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{fund.isin}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{fund.type}</Badge></TableCell>
                        <TableCell className="text-right font-medium">{fund.ter}%</TableCell>
                        <TableCell className="text-right">${fund.aum.toLocaleString()}</TableCell>
                        <TableCell>{fund.provider}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (fund.ter < 0.2 ? 5 : fund.ter < 0.5 ? 4 : fund.ter < 1 ? 3 : fund.ter < 1.5 ? 2 : 1)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factsheets Tab */}
        <TabsContent value="factsheets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fund Factsheets
              </CardTitle>
              <CardDescription>Download official fund documentation and KIIDs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleFunds.map((fund) => (
                  <Card key={fund.isin} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{fund.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">{fund.isin}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{fund.type}</Badge>
                        <Badge variant="secondary">{fund.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">TER</p>
                          <p className="font-medium">{fund.ter}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">1Y Return</p>
                          <p className={`font-medium ${getReturnColor(fund.oneYearReturn)}`}>{fund.oneYearReturn}%</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Download className="h-4 w-4" />
                          Factsheet
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <FileText className="h-4 w-4" />
                          KIID
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fund Detail Dialog */}
      <Dialog open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFund?.name}</DialogTitle>
            <DialogDescription className="font-mono">{selectedFund?.isin}</DialogDescription>
          </DialogHeader>
          {selectedFund && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge>{selectedFund.type}</Badge>
                <Badge variant="outline">{selectedFund.category}</Badge>
                <Badge variant="secondary">{selectedFund.provider}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Expense Ratio</p>
                    <p className="text-2xl font-bold">{selectedFund.ter}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">AUM</p>
                    <p className="text-2xl font-bold">${selectedFund.aum.toLocaleString()}M</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Risk Rating</p>
                    <p className={`text-2xl font-bold ${getRiskColor(selectedFund.riskRating)}`}>{selectedFund.riskRating}/7</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">YTD</p>
                      <p className={`font-bold ${getReturnColor(selectedFund.ytdReturn)}`}>{selectedFund.ytdReturn}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">1 Year</p>
                      <p className={`font-bold ${getReturnColor(selectedFund.oneYearReturn)}`}>{selectedFund.oneYearReturn}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">3 Year</p>
                      <p className={`font-bold ${getReturnColor(selectedFund.threeYearReturn)}`}>{selectedFund.threeYearReturn}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">5 Year</p>
                      <p className={`font-bold ${getReturnColor(selectedFund.fiveYearReturn)}`}>{selectedFund.fiveYearReturn}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download Factsheet
                </Button>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Provider Website
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
