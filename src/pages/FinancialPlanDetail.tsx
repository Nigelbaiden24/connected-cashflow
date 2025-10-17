import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, Plus, Trash2, TrendingUp, DollarSign, Calendar, Target, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FinancialPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Dialog states
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanDetails();
    }
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const [planRes, incomeRes, expenseRes, milestoneRes, recommendationRes] = await Promise.all([
        supabase.from("financial_plans").select("*").eq("id", id).single(),
        supabase.from("income_sources").select("*").eq("plan_id", id).order("created_at"),
        supabase.from("expense_categories").select("*").eq("plan_id", id).order("created_at"),
        supabase.from("plan_milestones").select("*").eq("plan_id", id).order("target_date"),
        supabase.from("plan_recommendations").select("*").eq("plan_id", id).order("priority"),
      ]);

      if (planRes.error) throw planRes.error;
      setPlan(planRes.data);
      setIncomes(incomeRes.data || []);
      setExpenses(expenseRes.data || []);
      setMilestones(milestoneRes.data || []);
      setRecommendations(recommendationRes.data || []);
    } catch (error: any) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    try {
      const { error } = await supabase
        .from("financial_plans")
        .update(plan)
        .eq("id", id);

      if (error) throw error;
      toast.success("Plan updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan");
    }
  };

  const addIncome = async (data: any) => {
    try {
      const { error } = await supabase.from("income_sources").insert({ ...data, plan_id: id });
      if (error) throw error;
      toast.success("Income source added");
      fetchPlanDetails();
      setIncomeDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to add income source");
    }
  };

  const addExpense = async (data: any) => {
    try {
      const { error } = await supabase.from("expense_categories").insert({ ...data, plan_id: id });
      if (error) throw error;
      toast.success("Expense added");
      fetchPlanDetails();
      setExpenseDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to add expense");
    }
  };

  const addMilestone = async (data: any) => {
    try {
      const { error } = await supabase.from("plan_milestones").insert({ ...data, plan_id: id });
      if (error) throw error;
      toast.success("Milestone added");
      fetchPlanDetails();
      setMilestoneDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to add milestone");
    }
  };

  const addRecommendation = async (data: any) => {
    try {
      const { error } = await supabase.from("plan_recommendations").insert({ ...data, plan_id: id });
      if (error) throw error;
      toast.success("Recommendation added");
      fetchPlanDetails();
      setRecommendationDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to add recommendation");
    }
  };

  const deleteItem = async (table: string, itemId: string) => {
    try {
      const { error } = await (supabase as any).from(table).delete().eq("id", itemId);
      if (error) throw error;
      toast.success("Item deleted");
      fetchPlanDetails();
    } catch (error: any) {
      toast.error("Failed to delete item");
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, i) => sum + (i.annual_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.annual_amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/financial-planning")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.plan_name}</h1>
            <p className="text-muted-foreground">{plan.plan_type}</p>
          </div>
          <Badge className={plan.status === "active" ? "bg-green-500" : "bg-gray-500"}>
            {plan.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={savePlan}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Plan
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Net Worth</p>
                <p className="text-2xl font-bold">
                  ${plan.current_net_worth ? (plan.current_net_worth / 1000).toFixed(0) : 0}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target Net Worth</p>
                <p className="text-2xl font-bold">
                  ${plan.target_net_worth ? (plan.target_net_worth / 1000).toFixed(0) : 0}K
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(netCashFlow / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                <p className="text-2xl font-bold">{plan.risk_tolerance || "N/A"}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income ({incomes.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Plan Name</Label>
                    <Input
                      value={plan.plan_name}
                      onChange={(e) => setPlan({ ...plan, plan_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Plan Type</Label>
                    <Select value={plan.plan_type} onValueChange={(v) => setPlan({ ...plan, plan_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                        <SelectItem value="Retirement">Retirement</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Tax Planning">Tax Planning</SelectItem>
                        <SelectItem value="Estate Planning">Estate Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={plan.notes || ""}
                      onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(plan.start_date), "MMM dd, yyyy")}</p>
                    </div>
                    {plan.end_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{format(new Date(plan.end_date), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                  </div>
                  {plan.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="mt-1">{plan.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Income Sources</h3>
            <IncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} onSave={addIncome} />
          </div>
          <div className="grid gap-4">
            {incomes.map((income) => (
              <Card key={income.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{income.source_name}</h4>
                      <p className="text-sm text-muted-foreground">{income.source_type}</p>
                      <p className="text-lg font-bold mt-2">${(income.annual_amount / 1000).toFixed(1)}K / year</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem("income_sources", income.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Categories</h3>
            <ExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} onSave={addExpense} />
          </div>
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{expense.category_name}</h4>
                      <p className="text-lg font-bold mt-2">${(expense.annual_amount / 1000).toFixed(1)}K / year</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem("expense_categories", expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plan Milestones</h3>
            <MilestoneDialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen} onSave={addMilestone} />
          </div>
          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{milestone.milestone_name}</h4>
                      <p className="text-sm text-muted-foreground">{format(new Date(milestone.target_date), "MMM dd, yyyy")}</p>
                      {milestone.target_amount && <p className="font-medium mt-1">${(milestone.target_amount / 1000).toFixed(0)}K</p>}
                      <Badge className={`mt-2 ${milestone.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`}>
                        {milestone.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem("plan_milestones", milestone.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <RecommendationDialog open={recommendationDialogOpen} onOpenChange={setRecommendationDialogOpen} onSave={addRecommendation} />
          </div>
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={rec.priority === "high" ? "bg-red-500" : rec.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.recommendation_type}</Badge>
                      </div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem("plan_recommendations", rec.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Dialog Components
function IncomeDialog({ open, onOpenChange, onSave }: any) {
  const [data, setData] = useState<Record<string, any>>({ source_name: "", source_type: "Employment", annual_amount: 0 });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Income</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Income Source</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Source Name</Label>
            <Input value={data.source_name} onChange={(e) => setData({ ...data, source_name: e.target.value })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={data.source_type} onValueChange={(v) => setData({ ...data, source_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Employment">Employment</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
                <SelectItem value="Pension">Pension</SelectItem>
                <SelectItem value="Rental">Rental</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Annual Amount</Label>
            <Input type="number" value={data.annual_amount} onChange={(e) => setData({ ...data, annual_amount: parseFloat(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseDialog({ open, onOpenChange, onSave }: any) {
  const [data, setData] = useState<Record<string, any>>({ category_name: "", annual_amount: 0, is_essential: true });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Category Name</Label>
            <Input value={data.category_name} onChange={(e) => setData({ ...data, category_name: e.target.value })} />
          </div>
          <div>
            <Label>Annual Amount</Label>
            <Input type="number" value={data.annual_amount} onChange={(e) => setData({ ...data, annual_amount: parseFloat(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MilestoneDialog({ open, onOpenChange, onSave }: any) {
  const [data, setData] = useState<Record<string, any>>({ milestone_name: "", target_date: "", target_amount: 0 });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Milestone</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Milestone Name</Label>
            <Input value={data.milestone_name} onChange={(e) => setData({ ...data, milestone_name: e.target.value })} />
          </div>
          <div>
            <Label>Target Date</Label>
            <Input type="date" value={data.target_date} onChange={(e) => setData({ ...data, target_date: e.target.value })} />
          </div>
          <div>
            <Label>Target Amount</Label>
            <Input type="number" value={data.target_amount} onChange={(e) => setData({ ...data, target_amount: parseFloat(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecommendationDialog({ open, onOpenChange, onSave }: any) {
  const [data, setData] = useState<Record<string, any>>({ title: "", description: "", priority: "medium", recommendation_type: "Investment" });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Recommendation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recommendation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={data.recommendation_type} onValueChange={(v) => setData({ ...data, recommendation_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Investment">Investment</SelectItem>
                <SelectItem value="Tax">Tax</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Estate">Estate</SelectItem>
                <SelectItem value="Retirement">Retirement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={data.priority} onValueChange={(v) => setData({ ...data, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
