import { useState, useEffect } from "react";
import { Plus, FileText, Edit, Trash2, Eye, TrendingUp, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FinancialPlan {
  id: string;
  client_id: string;
  plan_name: string;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  current_net_worth: number | null;
  target_net_worth: number | null;
  risk_tolerance: string | null;
  time_horizon: number | null;
  primary_objectives: string[] | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function FinancialPlanning() {
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FinancialPlan | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Form state
  const [formData, setFormData] = useState({
    client_id: "",
    plan_name: "",
    plan_type: "comprehensive",
    start_date: new Date(),
    end_date: null as Date | null,
    current_net_worth: "",
    target_net_worth: "",
    risk_tolerance: "moderate",
    time_horizon: "",
    primary_objectives: [] as string[],
    status: "draft",
    notes: "",
  });

  useEffect(() => {
    fetchPlans();
    fetchClients();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch financial plans");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, client_id")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        client_id: formData.client_id,
        plan_name: formData.plan_name,
        plan_type: formData.plan_type,
        start_date: format(formData.start_date, "yyyy-MM-dd"),
        end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : null,
        current_net_worth: formData.current_net_worth ? parseFloat(formData.current_net_worth) : null,
        target_net_worth: formData.target_net_worth ? parseFloat(formData.target_net_worth) : null,
        risk_tolerance: formData.risk_tolerance,
        time_horizon: formData.time_horizon ? parseInt(formData.time_horizon) : null,
        primary_objectives: formData.primary_objectives,
        status: formData.status,
        notes: formData.notes,
      };

      if (selectedPlan) {
        const { error } = await supabase
          .from("financial_plans")
          .update(planData)
          .eq("id", selectedPlan.id);

        if (error) throw error;
        toast.success("Financial plan updated successfully");
      } else {
        const { error } = await supabase
          .from("financial_plans")
          .insert(planData);

        if (error) throw error;
        toast.success("Financial plan created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message || "Failed to save financial plan");
      console.error(error);
    }
  };

  const handleEdit = (plan: FinancialPlan) => {
    setSelectedPlan(plan);
    setFormData({
      client_id: plan.client_id,
      plan_name: plan.plan_name,
      plan_type: plan.plan_type,
      start_date: new Date(plan.start_date),
      end_date: plan.end_date ? new Date(plan.end_date) : null,
      current_net_worth: plan.current_net_worth?.toString() || "",
      target_net_worth: plan.target_net_worth?.toString() || "",
      risk_tolerance: plan.risk_tolerance || "moderate",
      time_horizon: plan.time_horizon?.toString() || "",
      primary_objectives: plan.primary_objectives || [],
      status: plan.status,
      notes: plan.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this financial plan?")) return;

    try {
      const { error } = await supabase
        .from("financial_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Financial plan deleted successfully");
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to delete financial plan");
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedPlan(null);
    setFormData({
      client_id: "",
      plan_name: "",
      plan_type: "comprehensive",
      start_date: new Date(),
      end_date: null,
      current_net_worth: "",
      target_net_worth: "",
      risk_tolerance: "moderate",
      time_horizon: "",
      primary_objectives: [],
      status: "draft",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case "retirement": return <Target className="h-4 w-4" />;
      case "investment": return <TrendingUp className="h-4 w-4" />;
      case "estate": return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Planning</h1>
          <p className="text-muted-foreground">Create and manage comprehensive financial plans for clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Financial Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlan ? "Edit" : "Create"} Financial Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="financial">Financial Details</TabsTrigger>
                  <TabsTrigger value="objectives">Objectives</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client *</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.client_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plan_type">Plan Type *</Label>
                      <Select
                        value={formData.plan_type}
                        onValueChange={(value) => setFormData({ ...formData, plan_type: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                          <SelectItem value="retirement">Retirement Planning</SelectItem>
                          <SelectItem value="investment">Investment Strategy</SelectItem>
                          <SelectItem value="estate">Estate Planning</SelectItem>
                          <SelectItem value="tax">Tax Planning</SelectItem>
                          <SelectItem value="education">Education Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="plan_name">Plan Name *</Label>
                      <Input
                        id="plan_name"
                        value={formData.plan_name}
                        onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                        placeholder="e.g., 2025 Comprehensive Financial Plan"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.end_date || undefined}
                            onSelect={(date) => setFormData({ ...formData, end_date: date || null })}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time_horizon">Time Horizon (years)</Label>
                      <Input
                        id="time_horizon"
                        type="number"
                        value={formData.time_horizon}
                        onChange={(e) => setFormData({ ...formData, time_horizon: e.target.value })}
                        placeholder="e.g., 10"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_net_worth">Current Net Worth (£)</Label>
                      <Input
                        id="current_net_worth"
                        type="number"
                        step="0.01"
                        value={formData.current_net_worth}
                        onChange={(e) => setFormData({ ...formData, current_net_worth: e.target.value })}
                        placeholder="e.g., 500000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_net_worth">Target Net Worth (£)</Label>
                      <Input
                        id="target_net_worth"
                        type="number"
                        step="0.01"
                        value={formData.target_net_worth}
                        onChange={(e) => setFormData({ ...formData, target_net_worth: e.target.value })}
                        placeholder="e.g., 1000000"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                      <Select
                        value={formData.risk_tolerance}
                        onValueChange={(value) => setFormData({ ...formData, risk_tolerance: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                          <SelectItem value="very_aggressive">Very Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="objectives" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Plan Notes & Objectives</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Describe the primary objectives, strategies, and key considerations for this financial plan..."
                      className="min-h-32"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPlan ? "Update" : "Create"} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No financial plans yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first financial plan to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Financial Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanTypeIcon(plan.plan_type)}
                    <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </div>
                <CardDescription className="capitalize">{plan.plan_type.replace("_", " ")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{format(new Date(plan.start_date), "MMM d, yyyy")}</span>
                  </div>
                  {plan.end_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{format(new Date(plan.end_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {plan.time_horizon && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Horizon:</span>
                      <span>{plan.time_horizon} years</span>
                    </div>
                  )}
                  {plan.current_net_worth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Net Worth:</span>
                      <span>£{plan.current_net_worth.toLocaleString()}</span>
                    </div>
                  )}
                  {plan.target_net_worth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Net Worth:</span>
                      <span>£{plan.target_net_worth.toLocaleString()}</span>
                    </div>
                  )}
                  {plan.risk_tolerance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Tolerance:</span>
                      <span className="capitalize">{plan.risk_tolerance}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(plan)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
