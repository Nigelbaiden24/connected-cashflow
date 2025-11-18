import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Target, Plus, Calendar as CalendarIcon, DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle, Users, ArrowLeft, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Dummy data for financial goals
const goals = [
  {
    id: 1,
    title: "Emergency Fund",
    description: "3-6 months of expenses for financial security",
    targetAmount: 25000,
    currentAmount: 18500,
    targetDate: new Date(2024, 11, 31),
    priority: "high",
    status: "on-track",
    monthlyContribution: 500,
    category: "Safety Net"
  },
  {
    id: 2,
    title: "House Down Payment",
    description: "20% down payment for $400k home",
    targetAmount: 80000,
    currentAmount: 32000,
    targetDate: new Date(2026, 5, 15),
    priority: "high",
    status: "behind",
    monthlyContribution: 1200,
    category: "Major Purchase"
  },
  {
    id: 3,
    title: "Children's College Fund",
    description: "Education savings for 2 children",
    targetAmount: 150000,
    currentAmount: 45000,
    targetDate: new Date(2035, 8, 1),
    priority: "medium",
    status: "on-track",
    monthlyContribution: 800,
    category: "Education"
  },
  {
    id: 4,
    title: "Vacation Fund",
    description: "European vacation for family of 4",
    targetAmount: 12000,
    currentAmount: 8500,
    targetDate: new Date(2024, 6, 1),
    priority: "low",
    status: "ahead",
    monthlyContribution: 300,
    category: "Lifestyle"
  },
  {
    id: 5,
    title: "New Car Purchase",
    description: "Replace current vehicle in 3 years",
    targetAmount: 35000,
    currentAmount: 8200,
    targetDate: new Date(2027, 2, 1),
    priority: "medium",
    status: "on-track",
    monthlyContribution: 650,
    category: "Transportation"
  }
];

const categories = ["Safety Net", "Major Purchase", "Education", "Lifestyle", "Transportation", "Investment", "Other"];
const priorities = ["high", "medium", "low"];
const statuses = ["on-track", "ahead", "behind", "completed"];

export default function GoalPlanning() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Tables<'clients'> | null>(null);
  const [clients, setClients] = useState<Tables<'clients'>[]>([]);
  const [clientGoals, setClientGoals] = useState<Tables<'client_goals'>[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Tables<'client_goals'> | null>(null);
  const [newGoal, setNewGoal] = useState({
    goal_name: "",
    goal_type: "",
    target_amount: "",
    current_amount: "",
    target_date: undefined,
    priority: "Medium",
    monthly_contribution: "",
    notes: ""
  });

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch goals when client is selected
  useEffect(() => {
    if (selectedClient) {
      fetchClientGoals(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
  };

  const fetchClientGoals = async (clientId: string) => {
    const { data, error } = await supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setClientGoals(data || []);
    }
  };

  const handleAddGoal = async () => {
    if (!selectedClient) return;

    const goalData = {
      client_id: selectedClient.id,
      goal_name: newGoal.goal_name,
      goal_type: newGoal.goal_type,
      target_amount: parseFloat(newGoal.target_amount) || null,
      current_amount: parseFloat(newGoal.current_amount) || 0,
      target_date: newGoal.target_date?.toISOString().split('T')[0] || null,
      priority: newGoal.priority,
      monthly_contribution: parseFloat(newGoal.monthly_contribution) || 0,
      notes: newGoal.notes || null,
      status: 'On Track'
    };

    const { error } = await supabase
      .from('client_goals')
      .insert([goalData]);

    if (error) {
      console.error('Error adding goal:', error);
    } else {
      setIsAddingGoal(false);
      resetGoalForm();
      fetchClientGoals(selectedClient.id);
    }
  };

  const handleEditGoal = async () => {
    if (!selectedClient || !editingGoal) return;

    const goalData = {
      goal_name: newGoal.goal_name,
      goal_type: newGoal.goal_type,
      target_amount: parseFloat(newGoal.target_amount) || null,
      current_amount: parseFloat(newGoal.current_amount) || 0,
      target_date: newGoal.target_date?.toISOString().split('T')[0] || null,
      priority: newGoal.priority,
      monthly_contribution: parseFloat(newGoal.monthly_contribution) || 0,
      notes: newGoal.notes || null
    };

    const { error } = await supabase
      .from('client_goals')
      .update(goalData)
      .eq('id', editingGoal.id);

    if (error) {
      console.error('Error updating goal:', error);
    } else {
      setEditingGoal(null);
      resetGoalForm();
      fetchClientGoals(selectedClient.id);
    }
  };

  const resetGoalForm = () => {
    setNewGoal({
      goal_name: "",
      goal_type: "",
      target_amount: "",
      current_amount: "",
      target_date: undefined,
      priority: "Medium",
      monthly_contribution: "",
      notes: ""
    });
  };

  const startEditGoal = (goal: Tables<'client_goals'>) => {
    setEditingGoal(goal);
    setNewGoal({
      goal_name: goal.goal_name || "",
      goal_type: goal.goal_type || "",
      target_amount: goal.target_amount?.toString() || "",
      current_amount: goal.current_amount?.toString() || "",
      target_date: goal.target_date ? new Date(goal.target_date) : undefined,
      priority: goal.priority || "Medium",
      monthly_contribution: goal.monthly_contribution?.toString() || "",
      notes: goal.notes || ""
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "bg-primary text-primary-foreground";
      case "ahead": return "bg-success text-success-foreground";
      case "behind": return "bg-destructive text-destructive-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsToGoal = (current: number, target: number, monthly: number) => {
    if (monthly <= 0) return Infinity;
    return Math.ceil((target - current) / monthly);
  };

  const totalGoalAmount = clientGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalCurrentAmount = clientGoals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalMonthlyContributions = clientGoals.reduce((sum, goal) => sum + (goal.monthly_contribution || 0), 0);

  // If no client is selected, show client selection
  if (!selectedClient) {
    return (
      <div className="p-6 space-y-6 ml-64">
        <div className="flex items-center justify-between mb-6">
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
          </div>
        </div>
        <div className="text-center max-w-2xl mx-auto">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-2">Goal-Based Planning</h1>
          <p className="text-muted-foreground mb-6">
            Select a client to view and manage their financial goals
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Select a Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedClient(client)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>{client.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    AUM: {formatCurrency(client.aum || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ml-64">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Goals for {selectedClient.name}</h1>
            <p className="text-muted-foreground">Track and manage financial goals</p>
          </div>
        </div>
        <Dialog open={isAddingGoal || !!editingGoal} onOpenChange={(open) => {
          if (!open) {
            setIsAddingGoal(false);
            setEditingGoal(null);
            resetGoalForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update this financial goal' : 'Set up a new financial goal to track your progress'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal_name">Goal Name</Label>
                <Input
                  id="goal_name"
                  placeholder="e.g., Retirement Savings"
                  value={newGoal.goal_name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, goal_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal(prev => ({ ...prev, goal_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retirement">Retirement</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Major Purchase">Major Purchase</SelectItem>
                    <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="0"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_amount">Current Amount</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    placeholder="0"
                    value={newGoal.current_amount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, current_amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !newGoal.target_date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.target_date ? format(newGoal.target_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.target_date}
                      onSelect={(date) => setNewGoal(prev => ({ ...prev, target_date: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newGoal.priority} onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_contribution">Monthly Contribution</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  placeholder="0"
                  value={newGoal.monthly_contribution}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, monthly_contribution: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this goal"
                  value={newGoal.notes}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setIsAddingGoal(false);
                  setEditingGoal(null);
                  resetGoalForm();
                }} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={editingGoal ? handleEditGoal : handleAddGoal} className="flex-1">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goal Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGoalAmount)}</div>
            <p className="text-xs text-muted-foreground">Across {clientGoals.length} goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalCurrentAmount / totalGoalAmount) * 100).toFixed(1)}% of total goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyContributions)}</div>
            <p className="text-xs text-muted-foreground">Total monthly contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track Goals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientGoals.filter(g => g.status === "On Track" || g.status === "Ahead").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {clientGoals.length} total goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientGoals.map((goal) => {
            const progress = calculateProgress(goal.current_amount || 0, goal.target_amount || 0);
            const monthsToGoal = calculateMonthsToGoal(goal.current_amount || 0, goal.target_amount || 0, goal.monthly_contribution || 0);
            
            return (
              <Card key={goal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                      <CardDescription>{goal.goal_type}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getPriorityColor(goal.priority?.toLowerCase() || 'medium')}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status?.toLowerCase().replace(' ', '-') || 'on-track')}>
                        {goal.status || 'On Track'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.current_amount || 0)}</span>
                      <span>{formatCurrency(goal.target_amount || 0)}</span>
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Target Date</div>
                      <div className="font-medium flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {goal.target_date ? format(new Date(goal.target_date), "MMM yyyy") : "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Monthly Savings</div>
                      <div className="font-medium">{formatCurrency(goal.monthly_contribution || 0)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Priority</div>
                      <div className="font-medium">{goal.priority || 'Medium'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Months to Goal</div>
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {monthsToGoal === Infinity ? "∞" : `${monthsToGoal} mo`}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {goal.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">{goal.notes}</div>
                    </div>
                  )}

                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditGoal(goal)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Goal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {clientGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding a financial goal for {selectedClient.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}