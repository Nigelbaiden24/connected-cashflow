import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, DollarSign, TrendingUp, Filter, Phone, Mail, ArrowLeft, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EnterpriseSearch, enterpriseFuzzyMatch, type FilterField, type ActiveFilters } from "@/components/enterprise/EnterpriseSearch";
import { ClientReportGenerator, type ReportContext } from "@/components/enterprise/ClientReportGenerator";
import { toast } from "@/hooks/use-toast";
import { MeetingScheduler } from "@/components/MeetingScheduler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  aum: number;
  risk_profile: string;
  status: string;
  last_contact_date: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      // Delete related records first (cascade delete)
      const clientId = clientToDelete.id;

      // Delete portfolio holdings
      await supabase.from('portfolio_holdings').delete().eq('client_id', clientId);
      
      // Delete client goals
      await supabase.from('client_goals').delete().eq('client_id', clientId);
      
      // Delete client documents
      await supabase.from('client_documents').delete().eq('client_id', clientId);
      
      // Delete client meetings
      await supabase.from('client_meetings').delete().eq('client_id', clientId);
      
      // Delete financial plans
      await supabase.from('financial_plans').delete().eq('client_id', clientId);

      // Finally, delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Client Deleted",
        description: `${clientToDelete.name} and all related data have been removed.`,
      });

      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const portfolioAnalytics = [
    {
      category: "Conservative Clients",
      count: 147,
      totalAUM: "$98.2M",
      avgReturn: "+4.2%",
    },
    {
      category: "Moderate Clients",
      count: 203,
      totalAUM: "$156.8M",
      avgReturn: "+7.1%",
    },
    {
      category: "Aggressive Clients",
      count: 89,
      totalAUM: "$142.3M",
      avgReturn: "+12.8%",
    },
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         client.risk_profile.toLowerCase() === filterBy ||
                         client.status === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',  
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile?.toLowerCase()) {
      case "conservative":
        return "bg-chart-2/10 text-chart-2";
      case "moderate":
        return "bg-chart-1/10 text-chart-1";
      case "aggressive":
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "needs_review":
        return "bg-warning/10 text-warning-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground">
              Search and analyze client portfolios and risk profiles
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {clients.length} Total Clients
        </Badge>
      </div>

      {/* Enterprise Search */}
      <EnterpriseSearch
        placeholder="Search by name, email, client ID... (fuzzy matching)"
        storageKey="clients_search"
        filterFields={[
          { key: "risk_profile", label: "Risk Profile", type: "select", options: [
            { value: "conservative", label: "Conservative" },
            { value: "moderate", label: "Moderate" },
            { value: "aggressive", label: "Aggressive" },
          ]},
          { key: "status", label: "Status", type: "select", options: [
            { value: "active", label: "Active" },
            { value: "needs_review", label: "Needs Review" },
          ]},
          { key: "aum", label: "AUM (£)", type: "range", prefix: "£" },
          { key: "last_contact", label: "Last Contact", type: "date-range" },
        ]}
        onSearch={(query, filters) => {
          setSearchQuery(query);
          setFilterBy(
            (filters.risk_profile as string) || 
            (filters.status as string) || 
            "all"
          );
        }}
        resultCount={filteredClients.length}
      />

      {/* Report Generator */}
      <div className="flex justify-end">
        <ClientReportGenerator
          context={{
            moduleName: "Client Management",
            sections: [
              { id: "overview", title: "Client Overview", content: `Total clients: ${clients.length}\nActive: ${clients.filter(c => c.status === 'active').length}\nNeeds Review: ${clients.filter(c => c.status === 'needs_review').length}` },
              { id: "risk", title: "Risk Profile Distribution", content: `Conservative: ${clients.filter(c => c.risk_profile?.toLowerCase() === 'conservative').length}\nModerate: ${clients.filter(c => c.risk_profile?.toLowerCase() === 'moderate').length}\nAggressive: ${clients.filter(c => c.risk_profile?.toLowerCase() === 'aggressive').length}` },
              { id: "aum", title: "Assets Under Management", content: `Total AUM: £${clients.reduce((sum, c) => sum + (c.aum || 0), 0).toLocaleString()}\n\nClient Details:\n${clients.map(c => `• ${c.name}: £${(c.aum || 0).toLocaleString()} (${c.risk_profile})`).join('\n')}` },
              { id: "contacts", title: "Contact Summary", content: clients.map(c => `• ${c.name} — ${c.email} — ${c.phone}`).join('\n') },
            ],
            metadata: {
              total_clients: clients.length,
              total_aum: clients.reduce((sum, c) => sum + (c.aum || 0), 0),
            },
          }}
        />
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">Client List</TabsTrigger>
          <TabsTrigger value="profiles">Client Profiles</TabsTrigger>
          <TabsTrigger value="analytics">Portfolio Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading clients...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{client.name}</h3>
                          <Badge className={getRiskProfileColor(client.risk_profile)}>
                            {client.risk_profile}
                          </Badge>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status.replace("_", " ")}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Contact</p>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Portfolio</p>
                            <p className="font-medium">{formatCurrency(client.aum)} AUM</p>
                            <p className="text-xs">{client.risk_profile} Risk Profile</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Status</p>
                            <p>ID: {client.client_id}</p>
                            <p className="text-xs">
                              Last contact: {client.last_contact_date ? 
                                new Date(client.last_contact_date).toLocaleDateString() : 
                                'No contact recorded'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/clients/${client.client_id}`)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setSchedulerOpen(true);
                          }}
                        >
                          Schedule Call
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredClients.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No clients found matching your criteria
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profiles">
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <CardDescription>Client ID: {client.client_id}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getRiskProfileColor(client.risk_profile)}>
                        {client.risk_profile}
                      </Badge>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">PERSONAL INFORMATION</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">AUM: </span>
                          <span className="font-medium">{formatCurrency(client.aum)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk Profile: </span>
                          <span className="font-medium">{client.risk_profile}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">FINANCIAL SUMMARY</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Assets Under Management</span>
                          <div className="text-lg font-bold">{formatCurrency(client.aum)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Contact</span>
                          <div className="font-medium">
                            {client.last_contact_date ? 
                              new Date(client.last_contact_date).toLocaleDateString('en-GB') : 
                              'No contact recorded'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status</span>
                          <div className="font-medium">{client.status.replace("_", " ")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">ACTIONS</h3>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate(`/clients/${client.client_id}`)}
                        >
                          View Full Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedClient(client);
                            setSchedulerOpen(true);
                          }}
                        >
                          Schedule Meeting
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => toast({
                            title: "Message Sent",
                            description: `Message sent to ${client.name}.`,
                          })}
                        >
                          Send Message
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Client
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredClients.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No client profiles found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-3">
            {portfolioAnalytics.map((category) => (
              <Card key={category.category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {category.category}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{category.count}</div>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total AUM</span>
                      <span className="font-medium">{category.totalAUM}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Return</span>
                      <span className="font-medium text-success">{category.avgReturn}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>
                Client distribution across risk categories and asset allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Conservative (60% Bonds, 30% Equity, 10% Alt)</span>
                  <span className="font-medium">147 clients</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Moderate (50% Equity, 35% Bonds, 15% Alt)</span>
                  <span className="font-medium">203 clients</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Aggressive (70% Equity, 20% Alt, 10% Bonds)</span>
                  <span className="font-medium">89 clients</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {clientToDelete?.name}? This will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Client profile and contact information</li>
                <li>All portfolio holdings</li>
                <li>Financial goals and plans</li>
                <li>Meeting history</li>
                <li>All documents</li>
              </ul>
              <strong className="block mt-2">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedClient && (
        <MeetingScheduler
          open={schedulerOpen}
          onOpenChange={setSchedulerOpen}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </div>
  );
};

export default Clients;