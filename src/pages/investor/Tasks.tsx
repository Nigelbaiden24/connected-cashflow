import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { 
  Plus, 
  Search, 
  Filter, 
  Target, 
  TrendingUp, 
  Wallet, 
  PiggyBank,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  Zap,
  RefreshCw,
  Play,
  Pause,
  ChevronRight,
  ListTodo,
  Trophy,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "investment" | "savings" | "retirement" | "debt" | "insurance" | "tax" | "estate";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  dueDate: Date | null;
  linkedGoal?: string;
  progress: number;
  createdAt: Date;
}

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: "retirement" | "savings" | "investment" | "debt_payoff" | "emergency_fund";
  status: "on_track" | "behind" | "ahead";
  monthlyContribution: number;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review quarterly portfolio performance",
    description: "Analyze Q4 returns and compare against benchmark indices",
    category: "investment",
    priority: "high",
    status: "pending",
    dueDate: new Date(2025, 0, 15),
    linkedGoal: "1",
    progress: 0,
    createdAt: new Date(2024, 11, 1),
  },
  {
    id: "2",
    title: "Max out ISA contribution",
    description: "Transfer remaining allowance before tax year end",
    category: "savings",
    priority: "urgent",
    status: "in_progress",
    dueDate: new Date(2025, 3, 5),
    linkedGoal: "2",
    progress: 65,
    createdAt: new Date(2024, 10, 15),
  },
  {
    id: "3",
    title: "Rebalance retirement portfolio",
    description: "Adjust asset allocation to maintain 60/40 split",
    category: "retirement",
    priority: "medium",
    status: "pending",
    dueDate: new Date(2025, 1, 1),
    linkedGoal: "3",
    progress: 0,
    createdAt: new Date(2024, 11, 10),
  },
  {
    id: "4",
    title: "Review life insurance coverage",
    description: "Ensure coverage is adequate for current circumstances",
    category: "insurance",
    priority: "low",
    status: "completed",
    dueDate: new Date(2024, 11, 20),
    progress: 100,
    createdAt: new Date(2024, 10, 1),
  },
  {
    id: "5",
    title: "Submit self-assessment tax return",
    description: "Complete and file annual tax return",
    category: "tax",
    priority: "urgent",
    status: "in_progress",
    dueDate: new Date(2025, 0, 31),
    progress: 40,
    createdAt: new Date(2024, 11, 1),
  },
];

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Retirement Fund",
    targetAmount: 1000000,
    currentAmount: 425000,
    targetDate: new Date(2040, 0, 1),
    category: "retirement",
    status: "on_track",
    monthlyContribution: 2500,
  },
  {
    id: "2",
    title: "ISA Savings",
    targetAmount: 20000,
    currentAmount: 13000,
    targetDate: new Date(2025, 3, 5),
    category: "savings",
    status: "ahead",
    monthlyContribution: 1800,
  },
  {
    id: "3",
    title: "Emergency Fund",
    targetAmount: 30000,
    currentAmount: 22500,
    targetDate: new Date(2025, 6, 1),
    category: "emergency_fund",
    status: "on_track",
    monthlyContribution: 1200,
  },
  {
    id: "4",
    title: "Investment Portfolio Growth",
    targetAmount: 500000,
    currentAmount: 285000,
    targetDate: new Date(2030, 0, 1),
    category: "investment",
    status: "behind",
    monthlyContribution: 3000,
  },
];

const categoryConfig = {
  investment: { label: "Investment", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: TrendingUp },
  savings: { label: "Savings", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: PiggyBank },
  retirement: { label: "Retirement", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Trophy },
  debt: { label: "Debt", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: TrendingDown },
  insurance: { label: "Insurance", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Shield },
  tax: { label: "Tax", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: DollarSign },
  estate: { label: "Estate", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: Wallet },
};

const goalCategoryConfig = {
  retirement: { label: "Retirement", color: "from-purple-500 to-purple-600", icon: Trophy },
  savings: { label: "Savings", color: "from-emerald-500 to-emerald-600", icon: PiggyBank },
  investment: { label: "Investment", color: "from-blue-500 to-blue-600", icon: TrendingUp },
  debt_payoff: { label: "Debt Payoff", color: "from-red-500 to-red-600", icon: TrendingDown },
  emergency_fund: { label: "Emergency", color: "from-amber-500 to-amber-600", icon: Wallet },
};

import { Shield } from "lucide-react";

const priorityConfig = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", icon: Flag },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", icon: Flag },
  high: { label: "High", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", icon: Flag },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
};

const goalStatusConfig = {
  on_track: { label: "On Track", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  behind: { label: "Behind", color: "bg-red-500/10 text-red-600 border-red-500/30" },
  ahead: { label: "Ahead", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
};

export default function InvestorTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "investment" as Task["category"],
    priority: "medium" as Task["priority"],
    dueDate: null as Date | null,
    linkedGoal: "",
  });
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: 10000,
    currentAmount: 0,
    targetDate: null as Date | null,
    category: "savings" as Goal["category"],
    monthlyContribution: 500,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [tasks, searchQuery, categoryFilter, priorityFilter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length;
    return { total, completed, inProgress, pending, urgent, overdue, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  const goalStats = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalMonthly = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
    return { totalTarget, totalCurrent, totalMonthly, overallProgress: Math.round((totalCurrent / totalTarget) * 100) };
  }, [goals]);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
              progress: task.status === "completed" ? 0 : 100,
            }
          : task
      )
    );
    toast({
      title: "Task updated",
      description: "Task status has been changed.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  };

  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: "in_progress" as const, progress: task.progress || 10 }
          : task
      )
    );
    toast({
      title: "Task started",
      description: "Task is now in progress.",
    });
  };

  const handlePauseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: "pending" as const }
          : task
      )
    );
    toast({
      title: "Task paused",
      description: "Task has been paused.",
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleSaveEditTask = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id ? editingTask : task
      )
    );
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
    toast({
      title: "Task updated",
      description: "Your changes have been saved.",
    });
  };

  const handleUpdateProgress = (taskId: string, progress: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { 
              ...task, 
              progress, 
              status: progress === 100 ? "completed" as const : progress > 0 ? "in_progress" as const : "pending" as const 
            }
          : task
      )
    );
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      status: "pending",
      dueDate: newTask.dueDate,
      linkedGoal: newTask.linkedGoal || undefined,
      progress: 0,
      createdAt: new Date(),
    };

    setTasks((prev) => [task, ...prev]);
    setNewTask({
      title: "",
      description: "",
      category: "investment",
      priority: "medium",
      dueDate: null,
      linkedGoal: "",
    });
    setIsNewTaskDialogOpen(false);
    toast({
      title: "Task created",
      description: "Your new task has been added.",
    });
  };

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title.",
        variant: "destructive",
      });
      return;
    }

    if (!newGoal.targetDate) {
      toast({
        title: "Error",
        description: "Please select a target date.",
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      status: "on_track",
      monthlyContribution: newGoal.monthlyContribution,
    };

    setGoals((prev) => [goal, ...prev]);
    setNewGoal({
      title: "",
      targetAmount: 10000,
      currentAmount: 0,
      targetDate: null,
      category: "savings",
      monthlyContribution: 500,
    });
    setIsNewGoalDialogOpen(false);
    toast({
      title: "Goal created",
      description: "Your new financial goal has been added.",
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    toast({
      title: "Goal deleted",
      description: "The goal has been removed.",
    });
  };

  const getDaysUntilDue = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    return days;
  };

  const renderTaskCard = (task: Task) => {
    const category = categoryConfig[task.category];
    const priority = priorityConfig[task.priority];
    const PriorityIcon = priority.icon;
    const CategoryIcon = category.icon;
    const linkedGoal = goals.find((g) => g.id === task.linkedGoal);
    const daysUntilDue = getDaysUntilDue(task.dueDate);
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "completed";

    return (
      <Card 
        key={task.id} 
        className={cn(
          "group transition-all duration-300 hover:shadow-lg border-l-4 animate-fade-in",
          task.status === "completed" 
            ? "opacity-70 border-l-emerald-500 bg-emerald-500/5" 
            : isOverdue 
              ? "border-l-red-500 bg-red-500/5"
              : task.status === "in_progress"
                ? "border-l-blue-500 bg-blue-500/5"
                : "border-l-primary"
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="pt-0.5">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={() => handleToggleTask(task.id)}
                className="h-5 w-5 rounded-full transition-all duration-200"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md", category.color)}>
                      <CategoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className={cn(
                      "font-semibold text-base transition-all",
                      task.status === "completed" && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {task.status === "pending" && (
                      <DropdownMenuItem onClick={() => handleStartTask(task.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Task
                      </DropdownMenuItem>
                    )}
                    {task.status === "in_progress" && (
                      <DropdownMenuItem onClick={() => handlePauseTask(task.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Task
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-xs font-medium", category.color)}>
                  {category.label}
                </Badge>
                <Badge variant="secondary" className={cn("text-xs font-medium", priority.color)}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {priority.label}
                </Badge>
                {task.dueDate && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      isOverdue && "border-red-500/50 text-red-600 bg-red-500/10"
                    )}
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {isOverdue ? `${Math.abs(daysUntilDue!)} days overdue` : format(task.dueDate, "MMM d, yyyy")}
                  </Badge>
                )}
                {task.status === "in_progress" && (
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 bg-blue-500/10">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" style={{ animationDuration: "3s" }} />
                    In Progress
                  </Badge>
                )}
              </div>

              {linkedGoal && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50">
                  <Target className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground">Linked Goal</span>
                    <p className="text-sm font-medium truncate">{linkedGoal.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <p className="text-sm font-bold text-primary">
                      {Math.round((linkedGoal.currentAmount / linkedGoal.targetAmount) * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {task.status === "in_progress" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Task Progress</span>
                    <span className="font-bold text-primary">{task.progress}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[task.progress]}
                      onValueChange={([value]) => handleUpdateProgress(task.id, value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <ListTodo className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Investment Tasks & Goals</h1>
                <p className="text-muted-foreground">
                  Track your financial tasks and monitor progress towards your investment goals
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm">
                  <Target className="h-4 w-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Create Financial Goal
                  </DialogTitle>
                  <DialogDescription>
                    Set a new financial goal to track your investment progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                      id="goal-title"
                      placeholder="e.g., Retirement Fund, House Deposit"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value as Goal["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(goalCategoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-amount">Target Amount (£)</Label>
                      <Input
                        id="target-amount"
                        type="number"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-amount">Current Amount (£)</Label>
                      <Input
                        id="current-amount"
                        type="number"
                        value={newGoal.currentAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-contribution">Monthly Contribution (£)</Label>
                    <Input
                      id="monthly-contribution"
                      type="number"
                      value={newGoal.monthlyContribution}
                      onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newGoal.targetDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newGoal.targetDate ? format(newGoal.targetDate, "PPP") : "Select target date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newGoal.targetDate || undefined}
                          onSelect={(date) => setNewGoal({ ...newGoal, targetDate: date || null })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewGoalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Create New Task
                  </DialogTitle>
                  <DialogDescription>
                    Add a new financial task to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Review investment portfolio"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add details about this task..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) => setNewTask({ ...newTask, category: value as Task["category"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newTask.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate || undefined}
                          onSelect={(date) => setNewTask({ ...newTask, dueDate: date || null })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Link to Goal (Optional)</Label>
                    <Select
                      value={newTask.linkedGoal}
                      onValueChange={(value) => setNewTask({ ...newTask, linkedGoal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No linked goal</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{taskStats.completionRate}%</p>
                  <p className="text-sm text-muted-foreground font-medium">Task Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{taskStats.inProgress}</p>
                  <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500/10 via-red-500/5 to-background">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/20 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{taskStats.urgent}</p>
                  <p className="text-sm text-muted-foreground font-medium">Urgent Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{goalStats.overallProgress}%</p>
                  <p className="text-sm text-muted-foreground font-medium">Goal Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-12">
            <TabsTrigger value="tasks" className="gap-2 data-[state=active]:shadow-sm px-6">
              <ListTodo className="h-4 w-4" />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 data-[state=active]:shadow-sm px-6">
              <Target className="h-4 w-4" />
              Goals ({goals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 animate-fade-in">
            {/* Filters */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 bg-muted/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[160px] h-11">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[160px] h-11">
                        <Flag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="grid gap-4">
              {filteredTasks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-lg">No tasks found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                      {searchQuery || categoryFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters to find what you're looking for"
                        : "Create your first task to start tracking your financial progress"}
                    </p>
                    {!(searchQuery || categoryFilter !== "all" || priorityFilter !== "all") && (
                      <Button className="mt-4 gap-2" onClick={() => setIsNewTaskDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create Task
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map(renderTaskCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 animate-fade-in">
            {/* Goals Summary */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Portfolio Goals Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Combined progress across all your financial goals
                    </p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">£{goalStats.totalCurrent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Saved</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">£{goalStats.totalTarget.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Target Total</p>
                    </div>
                    <div className="pl-4 border-l">
                      <p className="text-2xl font-bold text-emerald-600">£{goalStats.totalMonthly.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Monthly Investment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                const statusConfig = goalStatusConfig[goal.status];
                const categoryConf = goalCategoryConfig[goal.category];
                const CategoryIcon = categoryConf.icon;
                const remaining = goal.targetAmount - goal.currentAmount;
                const monthsRemaining = Math.ceil(remaining / goal.monthlyContribution);

                return (
                  <Card 
                    key={goal.id} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
                  >
                    <div className={cn("h-2 bg-gradient-to-r", categoryConf.color)} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl bg-gradient-to-br text-white shadow-lg",
                            categoryConf.color
                          )}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              Target: {format(goal.targetDate, "MMM yyyy")}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Goal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Goal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs font-medium", statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                            <span className="font-bold text-lg">{progress}%</span>
                          </div>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                          <p className="font-bold text-xl">
                            £{goal.currentAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Target Value</p>
                          <p className="font-bold text-xl">
                            £{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Contribution</p>
                          <p className="font-semibold text-emerald-600">£{goal.monthlyContribution.toLocaleString()}/mo</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Est. Completion</p>
                          <p className="font-semibold">{monthsRemaining} months</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Edit Task
              </DialogTitle>
              <DialogDescription>
                Update the task details below.
              </DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingTask.category}
                      onValueChange={(value) => setEditingTask({ ...editingTask, category: value as Task["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Task["priority"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Progress: {editingTask.progress}%</Label>
                  <Slider
                    value={[editingTask.progress]}
                    onValueChange={([value]) => setEditingTask({ ...editingTask, progress: value })}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditTask} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
