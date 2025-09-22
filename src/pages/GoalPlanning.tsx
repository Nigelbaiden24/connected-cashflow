import { useState } from "react";
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
import { Target, Plus, Calendar as CalendarIcon, DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: undefined,
    priority: "medium",
    monthlyContribution: "",
    category: ""
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalMonthlyContributions = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Goal-Based Planning</h1>
          <p className="text-muted-foreground">Track and manage your financial goals</p>
        </div>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set up a new financial goal to track your progress</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Dream Vacation"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="0"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !newGoal.targetDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.targetDate ? format(newGoal.targetDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.targetDate}
                      onSelect={(date) => setNewGoal(prev => ({ ...prev, targetDate: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newGoal.priority} onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  placeholder="0"
                  value={newGoal.monthlyContribution}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddingGoal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setIsAddingGoal(false)} className="flex-1">
                  Create Goal
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
            <p className="text-xs text-muted-foreground">Across {goals.length} goals</p>
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
              {goals.filter(g => g.status === "on-track" || g.status === "ahead").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {goals.length} total goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const monthsToGoal = calculateMonthsToGoal(goal.currentAmount, goal.targetAmount, goal.monthlyContribution);
            
            return (
              <Card key={goal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status.replace('-', ' ')}
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
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Target Date</div>
                      <div className="font-medium flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(goal.targetDate, "MMM yyyy")}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Monthly Savings</div>
                      <div className="font-medium">{formatCurrency(goal.monthlyContribution)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Category</div>
                      <div className="font-medium">{goal.category}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Months to Goal</div>
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {monthsToGoal === Infinity ? "∞" : `${monthsToGoal} mo`}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {goal.status === "behind" && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive font-medium">
                          Consider increasing monthly contribution to ${Math.ceil((goal.targetAmount - goal.currentAmount) / 
                          Math.max(1, Math.floor((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))))}
                        </span>
                      </div>
                    </div>
                  )}

                  {goal.status === "ahead" && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">
                          You're ahead of schedule! Consider reducing contribution or accelerating timeline.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}