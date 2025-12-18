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
import { format } from "date-fns";
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
  BarChart3
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  },
  {
    id: "2",
    title: "ISA Savings",
    targetAmount: 20000,
    currentAmount: 13000,
    targetDate: new Date(2025, 3, 5),
    category: "savings",
    status: "ahead",
  },
  {
    id: "3",
    title: "Emergency Fund",
    targetAmount: 30000,
    currentAmount: 22500,
    targetDate: new Date(2025, 6, 1),
    category: "emergency_fund",
    status: "on_track",
  },
  {
    id: "4",
    title: "Investment Portfolio Growth",
    targetAmount: 500000,
    currentAmount: 285000,
    targetDate: new Date(2030, 0, 1),
    category: "investment",
    status: "behind",
  },
];

const categoryConfig = {
  investment: { label: "Investment", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  savings: { label: "Savings", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  retirement: { label: "Retirement", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  debt: { label: "Debt", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  insurance: { label: "Insurance", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  tax: { label: "Tax", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  estate: { label: "Estate", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600", icon: Flag },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600", icon: Flag },
  high: { label: "High", color: "bg-orange-100 text-orange-600", icon: Flag },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600", icon: AlertCircle },
};

const goalStatusConfig = {
  on_track: { label: "On Track", color: "bg-emerald-500/10 text-emerald-600" },
  behind: { label: "Behind", color: "bg-red-500/10 text-red-600" },
  ahead: { label: "Ahead", color: "bg-blue-500/10 text-blue-600" },
};

export default function FinanceTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [goals] = useState<Goal[]>(mockGoals);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "investment" as Task["category"],
    priority: "medium" as Task["priority"],
    dueDate: null as Date | null,
    linkedGoal: "",
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
    const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
    return { total, completed, inProgress, urgent, completionRate: Math.round((completed / total) * 100) };
  }, [tasks]);

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

  const renderTaskCard = (task: Task) => {
    const category = categoryConfig[task.category];
    const priority = priorityConfig[task.priority];
    const PriorityIcon = priority.icon;
    const linkedGoal = goals.find((g) => g.id === task.linkedGoal);

    return (
      <Card key={task.id} className={cn(
        "group transition-all duration-200 hover:shadow-md border-l-4",
        task.status === "completed" ? "opacity-60 border-l-emerald-500" : "border-l-primary"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={() => handleToggleTask(task.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h4 className={cn(
                    "font-medium text-sm",
                    task.status === "completed" && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className={cn("text-xs", category.color)}>
                  {category.label}
                </Badge>
                <Badge variant="secondary" className={cn("text-xs", priority.color)}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {priority.label}
                </Badge>
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(task.dueDate, "MMM d, yyyy")}
                  </Badge>
                )}
              </div>

              {linkedGoal && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-md">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Linked to:</span>
                  <span className="text-xs font-medium">{linkedGoal.title}</span>
                  <div className="flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round((linkedGoal.currentAmount / linkedGoal.targetAmount) * 100)}%
                  </span>
                </div>
              )}

              {task.status === "in_progress" && task.progress > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tasks & Goals</h1>
            <p className="text-muted-foreground">
              Track your financial tasks and monitor progress towards your goals
            </p>
          </div>
          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
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
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Circle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.urgent}</p>
                  <p className="text-xs text-muted-foreground">Urgent Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{goals.length}</p>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[140px]">
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
                      <SelectTrigger className="w-[140px]">
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
            <div className="grid gap-3">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery || categoryFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first task to get started"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map(renderTaskCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                const statusConfig = goalStatusConfig[goal.status];

                return (
                  <Card key={goal.id} className="group hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{goal.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Target: {format(goal.targetDate, "MMM yyyy")}
                          </CardDescription>
                        </div>
                        <Badge className={cn("text-xs", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold text-lg">
                            £{goal.currentAmount.toLocaleString()}
                          </p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        <div className="text-right">
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-semibold text-lg">
                            £{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          £{(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
