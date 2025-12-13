import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Building2, 
  Users, 
  Download, 
  UserPlus, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Globe,
  FileSpreadsheet,
  Database,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface CompanyData {
  company_name: string;
  company_number: string;
  company_status: string;
  sic_codes: string[];
  incorporation_date: string | null;
  registered_address: string;
}

interface OfficerData {
  full_name: string;
  officer_role: string;
  date_of_birth_month: number | null;
  date_of_birth_year: number | null;
  nationality: string | null;
  correspondence_address: string | null;
  appointed_date: string | null;
  resigned_date: string | null;
}

interface ScrapeResult {
  company: CompanyData;
  officers: OfficerData[];
}

export function CompaniesHouseScraper() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'company_name' | 'company_number' | 'officer_name'>('company_name');
  const [maxPages, setMaxPages] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('companies');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatusMessage('Initiating search...');
    setResults([]);
    setSelectedResults(new Set());

    try {
      setStatusMessage('Searching Companies House...');
      setProgress(10);

      const { data, error } = await supabase.functions.invoke('companies-house-scraper', {
        body: {
          action: 'full_scrape',
          query: searchQuery,
          searchType,
          maxPages
        }
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results || []);
        setProgress(100);
        setStatusMessage(`Found ${data.totalCompanies} companies with ${data.totalOfficers} officers`);
        
        toast({
          title: "Scrape Complete",
          description: `Successfully scraped ${data.totalCompanies} companies and ${data.totalOfficers} officers`,
        });
      } else {
        throw new Error(data.error || 'Scraping failed');
      }
    } catch (error: any) {
      console.error('Scraping error:', error);
      setStatusMessage('Scraping failed');
      toast({
        title: "Error",
        description: error.message || "Failed to scrape Companies House",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedResults(newSelected);
  };

  const selectAll = () => {
    if (selectedResults.size === results.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(results.map((_, i) => i)));
    }
  };

  const addToCRM = async () => {
    const selected = Array.from(selectedResults).map(i => results[i]);
    
    if (selected.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one company to add to CRM",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage('Adding to CRM...');

    try {
      // Add each officer as a CRM contact
      for (const result of selected) {
        for (const officer of result.officers) {
          const { error } = await supabase
            .from('crm_contacts')
            .insert({
              name: officer.full_name,
              company: result.company.company_name,
              position: officer.officer_role,
              notes: `Company Number: ${result.company.company_number}\n` +
                     `Nationality: ${officer.nationality || 'N/A'}\n` +
                     `DOB: ${officer.date_of_birth_month || '?'}/${officer.date_of_birth_year || '?'}\n` +
                     `Address: ${officer.correspondence_address || 'N/A'}`,
              status: 'new',
              priority: 'medium',
              tags: ['Companies House', result.company.company_status]
            });

          if (error) {
            console.error('Error adding contact:', error);
          }
        }
      }

      toast({
        title: "Success",
        description: `Added ${selected.reduce((sum, r) => sum + r.officers.length, 0)} contacts to CRM`,
      });
      
      setSelectedResults(new Set());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to CRM",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const downloadCSV = () => {
    const selected = selectedResults.size > 0 
      ? Array.from(selectedResults).map(i => results[i])
      : results;

    if (selected.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to download",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Full Name',
      'Officer Role',
      'Company Name',
      'Company Number',
      'Company Status',
      'SIC Codes',
      'Incorporation Date',
      'DOB Month',
      'DOB Year',
      'Nationality',
      'Correspondence Address',
      'Registered Address',
      'Appointed Date',
      'Resigned Date'
    ];

    const rows: string[][] = [];
    
    for (const result of selected) {
      for (const officer of result.officers) {
        rows.push([
          officer.full_name,
          officer.officer_role,
          result.company.company_name,
          result.company.company_number,
          result.company.company_status,
          result.company.sic_codes.join('; '),
          result.company.incorporation_date || '',
          officer.date_of_birth_month?.toString() || '',
          officer.date_of_birth_year?.toString() || '',
          officer.nationality || '',
          officer.correspondence_address || '',
          result.company.registered_address,
          officer.appointed_date || '',
          officer.resigned_date || ''
        ]);
      }
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `companies_house_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Downloaded",
      description: `Exported ${rows.length} records to CSV`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>;
    }
    if (statusLower.includes('dissolved')) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Dissolved</Badge>;
    }
    if (statusLower.includes('liquidation')) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Liquidation</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const totalOfficers = results.reduce((sum, r) => sum + r.officers.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Companies House Scraper</h2>
            <p className="text-muted-foreground">Extract director and business owner data from UK Companies House</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          UK Registry
        </Badge>
      </div>

      {/* Search Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Parameters
          </CardTitle>
          <CardDescription>Configure your search criteria for Companies House</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Search Query</Label>
              <Input
                placeholder="Enter company name, number, or officer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Search Type</Label>
              <Select value={searchType} onValueChange={(v: any) => setSearchType(v)} disabled={isLoading}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_name">Company Name</SelectItem>
                  <SelectItem value="company_number">Company Number</SelectItem>
                  <SelectItem value="officer_name">Officer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Max Pages to Scrape</Label>
              <Select value={maxPages.toString()} onValueChange={(v) => setMaxPages(parseInt(v))} disabled={isLoading}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 page (~10 companies)</SelectItem>
                  <SelectItem value="3">3 pages (~30 companies)</SelectItem>
                  <SelectItem value="5">5 pages (~50 companies)</SelectItem>
                  <SelectItem value="10">10 pages (~100 companies)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="w-full md:w-auto gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Start Scraping
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{statusMessage}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Throttling: 2-3 seconds between requests to comply with rate limits</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Companies Found</p>
                    <p className="text-3xl font-bold">{results.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Officers Found</p>
                    <p className="text-3xl font-bold">{totalOfficers}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected</p>
                    <p className="text-3xl font-bold">{selectedResults.size}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Companies</p>
                    <p className="text-3xl font-bold">
                      {results.filter(r => r.company.company_status.toLowerCase().includes('active')).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    {selectedResults.size === results.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedResults.size} of {results.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={downloadCSV}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={addToCRM}
                    disabled={selectedResults.size === 0 || isLoading}
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Database className="h-4 w-4" />
                    Add to CRM ({selectedResults.size > 0 
                      ? Array.from(selectedResults).reduce((sum, i) => sum + results[i].officers.length, 0) 
                      : 0} contacts)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Tabs */}
          <Card className="border-border/50">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="companies" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Companies ({results.length})
                  </TabsTrigger>
                  <TabsTrigger value="officers" className="gap-2">
                    <Users className="h-4 w-4" />
                    Officers ({totalOfficers})
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="companies" className="mt-0">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectedResults.size === results.length && results.length > 0}
                              onCheckedChange={() => selectAll()}
                            />
                          </TableHead>
                          <TableHead>Company Name</TableHead>
                          <TableHead>Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Officers</TableHead>
                          <TableHead>Incorporated</TableHead>
                          <TableHead>SIC Codes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result, index) => (
                          <TableRow 
                            key={index}
                            className={selectedResults.has(index) ? 'bg-muted/30' : ''}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={selectedResults.has(index)}
                                onCheckedChange={() => toggleSelect(index)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{result.company.company_name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {result.company.company_number}
                              </code>
                            </TableCell>
                            <TableCell>{getStatusBadge(result.company.company_status)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{result.officers.length}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.company.incorporation_date || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {result.company.sic_codes.slice(0, 2).join(', ') || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="officers" className="mt-0">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>DOB</TableHead>
                          <TableHead>Nationality</TableHead>
                          <TableHead>Appointed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.flatMap((result, companyIndex) => 
                          result.officers.map((officer, officerIndex) => (
                            <TableRow key={`${companyIndex}-${officerIndex}`}>
                              <TableCell className="font-medium">{officer.full_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{officer.officer_role}</Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {result.company.company_name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {officer.date_of_birth_month && officer.date_of_birth_year 
                                  ? `${officer.date_of_birth_month}/${officer.date_of_birth_year}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {officer.nationality || 'N/A'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {officer.appointed_date || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Enter a search query above to start scraping Companies House data
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Directors</Badge>
                <Badge variant="outline">Secretaries</Badge>
                <Badge variant="outline">PSC</Badge>
                <Badge variant="outline">Company Data</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
