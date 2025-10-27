import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Edit, Trash2, Eye, TrendingUp, Calendar, Target, ArrowLeft, Search, Filter, Grid3x3, List, Download, Upload, Copy, LayoutGrid, MoreVertical, CheckSquare, Square, Sparkles, Clock, Users, DollarSign, X } from "lucide-react";
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const navigate = useNavigate();
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FinancialPlan | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewPlan, setQuickViewPlan] = useState<FinancialPlan | null>(null);

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

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || plan.plan_type === filterType;
    const matchesStatus = filterStatus === "all" || plan.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const togglePlanSelection = (planId: string) => {
    const newSelected = new Set(selectedPlans);
    if (newSelected.has(planId)) {
      newSelected.delete(planId);
    } else {
      newSelected.add(planId);
    }
    setSelectedPlans(newSelected);
  };

  const toggleAllPlans = () => {
    if (selectedPlans.size === filteredPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(filteredPlans.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedPlans.size} selected plans?`)) return;
    try {
      const { error } = await supabase
        .from("financial_plans")
        .delete()
        .in("id", Array.from(selectedPlans));
      if (error) throw error;
      toast.success("Plans deleted successfully");
      setSelectedPlans(new Set());
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to delete plans");
    }
  };

  const handleBulkExport = () => {
    const selectedPlanData = plans.filter(p => selectedPlans.has(p.id));
    const csv = [
      ["Plan Name", "Type", "Status", "Start Date", "Current Net Worth", "Target Net Worth"].join(","),
      ...selectedPlanData.map(p => [
        p.plan_name,
        p.plan_type,
        p.status,
        p.start_date,
        p.current_net_worth || "N/A",
        p.target_net_worth || "N/A"
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-plans-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Plans exported successfully");
  };

  const handleDuplicatePlan = async (plan: FinancialPlan) => {
    try {
      const { id, created_at, ...planData } = plan;
      const { error } = await supabase
        .from("financial_plans")
        .insert({ ...planData, plan_name: `${plan.plan_name} (Copy)` });
      if (error) throw error;
      toast.success("Plan duplicated successfully");
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to duplicate plan");
    }
  };

  const planTemplates = [
    { name: "Retirement Planning", type: "retirement", objectives: ["Maximize retirement savings", "Tax-efficient withdrawal strategy"] },
    { name: "Investment Strategy", type: "investment", objectives: ["Diversified portfolio", "Long-term wealth growth"] },
    { name: "Estate Planning", type: "estate", objectives: ["Wealth transfer", "Minimize estate taxes"] }
  ];

  const createFromTemplate = (template: typeof planTemplates[0]) => {
    setFormData({
      ...formData,
      plan_name: template.name,
      plan_type: template.type,
      notes: template.objectives.join("\n")
    });
    setIsDialogOpen(true);
  };

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === "active").length,
    totalValue: plans.reduce((sum, p) => sum + (p.current_net_worth || 0), 0),
    avgTimeHorizon: plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + (p.time_horizon || 0), 0) / plans.length) : 0
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Financial Planning</h1>
              <p className="text-muted-foreground">Create and manage comprehensive financial plans</p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {planTemplates.map((template, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => createFromTemplate(template)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold">£{(stats.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Horizon</p>
                  <p className="text-2xl font-bold">{stats.avgTimeHorizon} yrs</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="estate">Estate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {selectedPlans.size > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedPlans.size})
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedPlans.size})
                </Button>
              </>
            )}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-x"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-l-none"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

      {/* Content Area */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">{searchQuery || filterType !== "all" || filterStatus !== "all" ? "No plans found" : "No financial plans yet"}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterType !== "all" || filterStatus !== "all" 
                ? "Try adjusting your filters" 
                : "Create your first financial plan to get started"}
            </p>
            {!searchQuery && filterType === "all" && filterStatus === "all" && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Financial Plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-all hover:scale-[1.02] group relative">
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={selectedPlans.has(plan.id)}
                  onCheckedChange={() => togglePlanSelection(plan.id)}
                  className="bg-background"
                />
              </div>
              <CardHeader className="pt-12">
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
                  {plan.current_net_worth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-semibold">£{plan.current_net_worth.toLocaleString()}</span>
                    </div>
                  )}
                  {plan.target_net_worth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-semibold text-primary">£{plan.target_net_worth.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                    setQuickViewPlan(plan);
                    setIsQuickViewOpen(true);
                  }}>
                    <Eye className="h-3 w-3 mr-1" />
                    Quick View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedPlans.has(plan.id)}
                    onCheckedChange={() => togglePlanSelection(plan.id)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {getPlanTypeIcon(plan.plan_type)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{plan.plan_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{plan.plan_type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(plan.start_date), "MMM d, yyyy")}
                  </div>
                  {plan.current_net_worth && (
                    <div className="text-sm font-semibold">
                      £{plan.current_net_worth.toLocaleString()}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setQuickViewPlan(plan);
                      setIsQuickViewOpen(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <ScrollArea className="h-[600px]">
            <div className="p-4">
              <div className="flex items-center gap-4 pb-3 border-b font-semibold text-sm">
                <div className="w-8">
                  <Checkbox
                    checked={selectedPlans.size === filteredPlans.length && filteredPlans.length > 0}
                    onCheckedChange={toggleAllPlans}
                  />
                </div>
                <div className="flex-1">Plan Name</div>
                <div className="w-32">Type</div>
                <div className="w-24">Status</div>
                <div className="w-32">Start Date</div>
                <div className="w-32">Net Worth</div>
                <div className="w-24">Actions</div>
              </div>
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="flex items-center gap-4 py-3 border-b hover:bg-muted/50 transition-colors">
                  <div className="w-8">
                    <Checkbox
                      checked={selectedPlans.has(plan.id)}
                      onCheckedChange={() => togglePlanSelection(plan.id)}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {getPlanTypeIcon(plan.plan_type)}
                    <span className="font-medium">{plan.plan_name}</span>
                  </div>
                  <div className="w-32 text-sm capitalize text-muted-foreground">{plan.plan_type.replace("_", " ")}</div>
                  <div className="w-24">
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  </div>
                  <div className="w-32 text-sm">{format(new Date(plan.start_date), "MMM d, yyyy")}</div>
                  <div className="w-32 text-sm font-semibold">
                    {plan.current_net_worth ? `£${plan.current_net_worth.toLocaleString()}` : "N/A"}
                  </div>
                  <div className="w-24 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setQuickViewPlan(plan);
                      setIsQuickViewOpen(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Quick View Drawer */}
      <Drawer open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{quickViewPlan?.plan_name}</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          {quickViewPlan && (
            <ScrollArea className="h-[60vh] px-6 pb-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {getPlanTypeIcon(quickViewPlan.plan_type)}
                  <div>
                    <Badge className={getStatusColor(quickViewPlan.status)}>{quickViewPlan.status}</Badge>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{quickViewPlan.plan_type.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Start Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{format(new Date(quickViewPlan.start_date), "MMMM d, yyyy")}</p>
                    </CardContent>
                  </Card>
                  {quickViewPlan.end_date && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">End Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{format(new Date(quickViewPlan.end_date), "MMMM d, yyyy")}</p>
                      </CardContent>
                    </Card>
                  )}
                  {quickViewPlan.time_horizon && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Time Horizon</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{quickViewPlan.time_horizon} years</p>
                      </CardContent>
                    </Card>
                  )}
                  {quickViewPlan.risk_tolerance && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Risk Tolerance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold capitalize">{quickViewPlan.risk_tolerance}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {(quickViewPlan.current_net_worth || quickViewPlan.target_net_worth) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quickViewPlan.current_net_worth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Net Worth:</span>
                          <span className="text-xl font-bold">£{quickViewPlan.current_net_worth.toLocaleString()}</span>
                        </div>
                      )}
                      {quickViewPlan.target_net_worth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Target Net Worth:</span>
                          <span className="text-xl font-bold text-primary">£{quickViewPlan.target_net_worth.toLocaleString()}</span>
                        </div>
                      )}
                      {quickViewPlan.current_net_worth && quickViewPlan.target_net_worth && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Growth Needed:</span>
                          <span className="text-lg font-semibold text-green-600">
                            +{((quickViewPlan.target_net_worth - quickViewPlan.current_net_worth) / quickViewPlan.current_net_worth * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {quickViewPlan.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes & Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{quickViewPlan.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => {
                    handleEdit(quickViewPlan);
                    setIsQuickViewOpen(false);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicatePlan(quickViewPlan)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
