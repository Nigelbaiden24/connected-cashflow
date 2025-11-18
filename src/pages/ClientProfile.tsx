import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Calendar, 
  DollarSign, 
  Target, 
  FileText, 
  TrendingUp,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Plus,
  Trash2
} from "lucide-react";

interface Client {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  aum: number;
  risk_profile: string;
  status: string;
  date_of_birth: string;
  address: string;
  occupation: string;
  annual_income: number;
  net_worth: number;
  investment_experience: string;
  investment_objectives: string[];
  liquidity_needs: string;
  time_horizon: number;
  notes: string;
}

interface PortfolioHolding {
  id: string;
  asset_type: string;
  asset_name: string;
  symbol: string;
  quantity: number;
  current_value: number;
  allocation_percentage: number;
}

interface ClientGoal {
  id: string;
  goal_type: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  status: string;
  monthly_contribution: number;
  notes: string;
}

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    if (!id) return;
    
    try {
      // Fetch client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('client_id', id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch portfolio holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('client_id', clientData.id);

      if (holdingsError) throw holdingsError;
      setPortfolioHoldings(holdingsData || []);

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('client_goals')
        .select('*')
        .eq('client_id', clientData.id);

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!client) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          email: client.email,
          phone: client.phone,
          aum: client.aum,
          risk_profile: client.risk_profile,
          status: client.status,
          date_of_birth: client.date_of_birth,
          address: client.address,
          occupation: client.occupation,
          annual_income: client.annual_income,
          net_worth: client.net_worth,
          investment_experience: client.investment_experience,
          investment_objectives: client.investment_objectives,
          liquidity_needs: client.liquidity_needs,
          time_horizon: client.time_horizon,
          notes: client.notes,
        })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client profile",
        variant: "destructive",
      });
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 ml-64">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading client profile...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 space-y-6 p-6 ml-64">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Client not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">Client ID: {client.client_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getRiskProfileColor(client.risk_profile)}>
            {client.risk_profile}
          </Badge>
          <Badge className={getStatusColor(client.status)}>
            {client.status.replace("_", " ")}
          </Badge>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="goals">Goals & Planning</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(client.aum)}</div>
                <p className="text-xs text-muted-foreground">
                  Net Worth: {formatCurrency(client.net_worth)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(client.annual_income)}</div>
                <p className="text-xs text-muted-foreground">
                  Time Horizon: {client.time_horizon} years
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.length}</div>
                <p className="text-xs text-muted-foreground">
                  Financial objectives tracked
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Investment Objectives & Risk Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Investment Objectives</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {client.investment_objectives?.map((objective, index) => (
                      <Badge key={index} variant="outline">{objective}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Investment Experience</Label>
                  <p className="text-sm text-muted-foreground mt-1">{client.investment_experience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Liquidity Needs</Label>
                  <p className="text-sm text-muted-foreground mt-1">{client.liquidity_needs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic client details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={client.name}
                        onChange={(e) => setClient({ ...client, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{client.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={client.email}
                        onChange={(e) => setClient({ ...client, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={client.phone || ''}
                        onChange={(e) => setClient({ ...client, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    {isEditing ? (
                      <Input
                        id="occupation"
                        value={client.occupation || ''}
                        onChange={(e) => setClient({ ...client, occupation: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{client.occupation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Textarea
                      id="address"
                      value={client.address || ''}
                      onChange={(e) => setClient({ ...client, address: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={client.date_of_birth || ''}
                        onChange={(e) => setClient({ ...client, date_of_birth: e.target.value })}
                      />
                    ) : (
                      <span>{client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not provided'}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk_profile">Risk Profile</Label>
                    {isEditing ? (
                      <Select
                        value={client.risk_profile}
                        onValueChange={(value) => setClient({ ...client, risk_profile: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservative">Conservative</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getRiskProfileColor(client.risk_profile)}>
                        {client.risk_profile}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={client.status}
                        onValueChange={(value) => setClient({ ...client, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="needs_review">Needs Review</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(client.status)}>
                        {client.status.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  {isEditing ? (
                    <Textarea
                      id="notes"
                      value={client.notes || ''}
                      onChange={(e) => setClient({ ...client, notes: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{client.notes || 'No additional notes'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Holdings</CardTitle>
                <CardDescription>Current investment allocation and holdings</CardDescription>
              </CardHeader>
              <CardContent>
                {portfolioHoldings.length > 0 ? (
                  <div className="space-y-4">
                    {portfolioHoldings.map((holding) => (
                      <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{holding.asset_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {holding.asset_type} • {holding.symbol}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-medium">{formatCurrency(holding.current_value)}</div>
                          <div className="text-sm text-muted-foreground">
                            {holding.allocation_percentage}% allocation
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No portfolio holdings found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track progress toward financial objectives</CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{goal.goal_name}</h4>
                            <p className="text-sm text-muted-foreground">{goal.goal_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'secondary'}>
                              {goal.priority}
                            </Badge>
                            <Badge variant={goal.status === 'On Track' ? 'default' : 'destructive'}>
                              {goal.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Target Amount</p>
                            <p className="font-medium">{formatCurrency(goal.target_amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Amount</p>
                            <p className="font-medium">{formatCurrency(goal.current_amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Target Date</p>
                            <p className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {goal.notes && (
                          <p className="text-sm text-muted-foreground">{goal.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No financial goals set
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle>Meeting History</CardTitle>
              <CardDescription>Past and upcoming client meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No meetings scheduled or recorded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Client Documents</CardTitle>
              <CardDescription>Uploaded documents and statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No documents uploaded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;