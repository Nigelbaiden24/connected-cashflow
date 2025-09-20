import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, DollarSign, TrendingUp, Filter, Phone, Mail } from "lucide-react";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const clients = [
    {
      id: "CL001",
      name: "Robert Johnson",
      email: "r.johnson@email.com",
      phone: "(555) 123-4567",
      aum: "$2.4M",
      riskProfile: "Conservative",
      lastContact: "2 days ago",
      portfolio: "60% Bonds, 30% Equity, 10% Alt",
      status: "active",
    },
    {
      id: "CL002",
      name: "Sarah Williams",
      email: "s.williams@email.com",
      phone: "(555) 234-5678",
      aum: "$1.8M",
      riskProfile: "Moderate",
      lastContact: "1 week ago",
      portfolio: "50% Equity, 35% Bonds, 15% Alt",
      status: "active",
    },
    {
      id: "CL003",
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "(555) 345-6789",
      aum: "$3.2M",
      riskProfile: "Aggressive",
      lastContact: "3 days ago",
      portfolio: "70% Equity, 20% Alt, 10% Bonds",
      status: "active",
    },
    {
      id: "CL004",
      name: "Emma Davis",
      email: "e.davis@email.com",
      phone: "(555) 456-7890",
      aum: "$950K",
      riskProfile: "Conservative",
      lastContact: "2 weeks ago",
      portfolio: "65% Bonds, 25% Equity, 10% Cash",
      status: "needs_review",
    },
  ];

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
                         client.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         client.riskProfile.toLowerCase() === filterBy ||
                         client.status === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const getRiskProfileColor = (profile: string) => {
    switch (profile.toLowerCase()) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Search and analyze client portfolios and risk profiles
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {clients.length} Total Clients
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or client ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Clients</option>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">Client List</TabsTrigger>
          <TabsTrigger value="analytics">Portfolio Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{client.name}</h3>
                        <Badge className={getRiskProfileColor(client.riskProfile)}>
                          {client.riskProfile}
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
                          <p className="font-medium">{client.aum} AUM</p>
                          <p className="text-xs">{client.portfolio}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Status</p>
                          <p>ID: {client.id}</p>
                          <p className="text-xs">Last contact: {client.lastContact}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button size="sm">
                        Schedule Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
};

export default Clients;