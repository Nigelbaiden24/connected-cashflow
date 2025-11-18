import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, Grid3x3, List, Table as TableIcon, MoreVertical, Edit, Trash2, Eye, Copy, Download, CheckSquare, Square, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";

// Import new enterprise components
import { PortfolioHealthKPIs } from "@/components/financial-planning/PortfolioHealthKPIs";
import { AIInsightsPanel } from "@/components/financial-planning/AIInsightsPanel";
import { PlanComments } from "@/components/financial-planning/PlanComments";
import { PlanTasks } from "@/components/financial-planning/PlanTasks";
import { SmartAlertsManager } from "@/components/financial-planning/SmartAlertsManager";
import { AdvancedFilters } from "@/components/financial-planning/AdvancedFilters";
import { PlanExporter } from "@/components/financial-planning/PlanExporter";
import { PlanCharts } from "@/components/financial-planning/PlanCharts";

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

export default function FinancialPlanningEnhanced() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<FinancialPlan[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FinancialPlan | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    applySearchFilter();
  }, [searchQuery, plans]);

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
      toast.error("Failed to fetch clients");
      console.error(error);
    }
  };

  const applySearchFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredPlans(plans);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = plans.filter(plan => 
      plan.plan_name.toLowerCase().includes(query) ||
      plan.plan_type.toLowerCase().includes(query) ||
      plan.status.toLowerCase().includes(query)
    );
    setFilteredPlans(filtered);
  };

  const handleAdvancedFilterChange = (filters: any) => {
    let filtered = [...plans];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.plan_name.toLowerCase().includes(query) ||
        plan.plan_type.toLowerCase().includes(query) ||
        plan.status.toLowerCase().includes(query)
      );
    }

    // Apply plan type filter
    if (filters.planType && filters.planType !== "all") {
      filtered = filtered.filter(p => p.plan_type === filters.planType);
    }

    // Apply risk tolerance filter
    if (filters.riskTolerance && filters.riskTolerance !== "all") {
      filtered = filtered.filter(p => p.risk_tolerance === filters.riskTolerance);
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Apply time horizon filter
    if (filters.minTimeHorizon) {
      filtered = filtered.filter(p => (p.time_horizon || 0) >= parseFloat(filters.minTimeHorizon));
    }
    if (filters.maxTimeHorizon) {
      filtered = filtered.filter(p => (p.time_horizon || 0) <= parseFloat(filters.maxTimeHorizon));
    }

    // Apply AUM filter
    if (filters.minAUM) {
      filtered = filtered.filter(p => (p.current_net_worth || 0) >= parseFloat(filters.minAUM));
    }
    if (filters.maxAUM) {
      filtered = filtered.filter(p => (p.current_net_worth || 0) <= parseFloat(filters.maxAUM));
    }

    setFilteredPlans(filtered);
  };

  const handleSubmit = async () => {
    if (!formData.plan_name || !formData.client_id) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const planData = {
        ...formData,
        start_date: format(formData.start_date, "yyyy-MM-dd"),
        end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : null,
        current_net_worth: formData.current_net_worth ? parseFloat(formData.current_net_worth) : null,
        target_net_worth: formData.target_net_worth ? parseFloat(formData.target_net_worth) : null,
        time_horizon: formData.time_horizon ? parseInt(formData.time_horizon) : null,
      };

      if (selectedPlan) {
        const { error } = await supabase
          .from("financial_plans")
          .update(planData)
          .eq("id", selectedPlan.id);

        if (error) throw error;
        toast.success("Plan updated successfully");
      } else {
        const { error } = await supabase
          .from("financial_plans")
          .insert(planData);

        if (error) throw error;
        toast.success("Plan created successfully");
      }

      setIsDialogOpen(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to save plan");
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

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const { error } = await supabase
        .from("financial_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      toast.success("Plan deleted");
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to delete plan");
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlans.size === 0) return;
    if (!confirm(`Delete ${selectedPlans.size} selected plans?`)) return;

    try {
      const { error } = await supabase
        .from("financial_plans")
        .delete()
        .in("id", Array.from(selectedPlans));

      if (error) throw error;
      toast.success("Plans deleted");
      setSelectedPlans(new Set());
      fetchPlans();
    } catch (error: any) {
      toast.error("Failed to delete plans");
      console.error(error);
    }
  };

  const handleSelectAll = () => {
    if (selectedPlans.size === filteredPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(filteredPlans.map(p => p.id)));
    }
  };

  const handleQuickView = (plan: FinancialPlan) => {
    setQuickViewPlan(plan);
    setIsQuickViewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "draft": return "secondary";
      case "under_review": return "default";
      case "completed": return "outline";
      default: return "default";
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "£0";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading financial plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/finance")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Financial Planning</h1>
            <p className="text-muted-foreground">Comprehensive enterprise planning suite</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
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
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Financial Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlan ? "Edit" : "Create"} Financial Plan</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial Details</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label>Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
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

                <div>
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    placeholder="Enter plan name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plan Type</Label>
                    <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="tax">Tax Planning</SelectItem>
                        <SelectItem value="estate">Estate Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {format(formData.start_date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.start_date}
                          onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.end_date || undefined}
                          onSelect={(date) => setFormData({ ...formData, end_date: date || null })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Net Worth (£)</Label>
                    <Input
                      type="number"
                      value={formData.current_net_worth}
                      onChange={(e) => setFormData({ ...formData, current_net_worth: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Target Net Worth (£)</Label>
                    <Input
                      type="number"
                      value={formData.target_net_worth}
                      onChange={(e) => setFormData({ ...formData, target_net_worth: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Risk Tolerance</Label>
                    <Select value={formData.risk_tolerance} onValueChange={(value) => setFormData({ ...formData, risk_tolerance: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Time Horizon (years)</Label>
                    <Input
                      type="number"
                      value={formData.time_horizon}
                      onChange={(e) => setFormData({ ...formData, time_horizon: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4">
                <div>
                  <Label>Primary Objectives</Label>
                  <div className="space-y-2">
                    {["Wealth Accumulation", "Retirement Planning", "Tax Optimization", "Estate Planning", "Risk Management", "Education Funding"].map((obj) => (
                      <div key={obj} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.primary_objectives.includes(obj)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                primary_objectives: [...formData.primary_objectives, obj]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                primary_objectives: formData.primary_objectives.filter(o => o !== obj)
                              });
                            }
                          }}
                        />
                        <label className="text-sm">{obj}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{selectedPlan ? "Update" : "Create"} Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Health KPIs */}
      <PortfolioHealthKPIs plans={plans} />

      {/* AI Insights Panel */}
      <AIInsightsPanel plans={plans} />

      {/* Smart Alerts */}
      <SmartAlertsManager />

      {/* Charts */}
      <PlanCharts plans={plans} />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <AdvancedFilters onFilterChange={handleAdvancedFilterChange} />
            </div>

            <div className="flex items-center gap-2">
              {selectedPlans.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedPlans.size})
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              <PlanExporter plans={plans} selectedPlans={Array.from(selectedPlans)} />
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No financial plans found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedPlans.has(plan.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedPlans);
                            if (checked) {
                              newSelected.add(plan.id);
                            } else {
                              newSelected.delete(plan.id);
                            }
                            setSelectedPlans(newSelected);
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                          <Badge variant={getStatusColor(plan.status) as any} className="mt-1">
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleQuickView(plan)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Quick View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{plan.plan_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk</p>
                        <p className="font-medium capitalize">{plan.risk_tolerance || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current AUM</p>
                        <p className="font-medium">{formatCurrency(plan.current_net_worth)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">{formatCurrency(plan.target_net_worth)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedPlans.has(plan.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedPlans);
                            if (checked) {
                              newSelected.add(plan.id);
                            } else {
                              newSelected.delete(plan.id);
                            }
                            setSelectedPlans(newSelected);
                          }}
                        />
                        <div>
                          <p className="font-medium">{plan.plan_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{plan.plan_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusColor(plan.status) as any}>{plan.status}</Badge>
                        <span className="text-sm font-medium">{formatCurrency(plan.current_net_worth)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickView(plan)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
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
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedPlans.size === filteredPlans.length && filteredPlans.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left">Plan Name</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Risk</th>
                    <th className="p-4 text-right">AUM</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedPlans.has(plan.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedPlans);
                            if (checked) {
                              newSelected.add(plan.id);
                            } else {
                              newSelected.delete(plan.id);
                            }
                            setSelectedPlans(newSelected);
                          }}
                        />
                      </td>
                      <td className="p-4 font-medium">{plan.plan_name}</td>
                      <td className="p-4 capitalize">{plan.plan_type}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(plan.status) as any}>{plan.status}</Badge>
                      </td>
                      <td className="p-4 capitalize">{plan.risk_tolerance || "N/A"}</td>
                      <td className="p-4 text-right">{formatCurrency(plan.current_net_worth)}</td>
                      <td className="p-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickView(plan)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick View Drawer */}
      <Drawer open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{quickViewPlan?.plan_name}</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <ScrollArea className="h-full px-6 pb-6">
            {quickViewPlan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan Type</p>
                    <p className="font-medium capitalize">{quickViewPlan.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusColor(quickViewPlan.status) as any}>{quickViewPlan.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                    <p className="font-medium capitalize">{quickViewPlan.risk_tolerance || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Horizon</p>
                    <p className="font-medium">{quickViewPlan.time_horizon || "N/A"} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Net Worth</p>
                    <p className="font-medium">{formatCurrency(quickViewPlan.current_net_worth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Net Worth</p>
                    <p className="font-medium">{formatCurrency(quickViewPlan.target_net_worth)}</p>
                  </div>
                </div>

                {quickViewPlan.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{quickViewPlan.notes}</p>
                  </div>
                )}

                <Separator />

                <Tabs defaultValue="comments" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments">
                    <PlanComments planId={quickViewPlan.id} />
                  </TabsContent>
                  <TabsContent value="tasks">
                    <PlanTasks planId={quickViewPlan.id} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}