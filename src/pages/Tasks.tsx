import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Plus, ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskCard } from "@/components/business/TaskCard";
import { TaskStats } from "@/components/business/TaskStats";

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review quarterly reports",
      project: "Financial Review",
      priority: "high",
      dueDate: "2024-02-20",
      status: "pending",
      completed: false,
      description: "Complete analysis of Q4 financial performance and prepare presentation",
      tags: ["finance", "reporting"]
    },
    {
      id: 2,
      title: "Update project documentation",
      project: "Website Redesign",
      priority: "medium",
      dueDate: "2024-02-22",
      status: "in-progress",
      completed: false,
      description: "Update technical documentation with new architecture changes",
      tags: ["documentation", "technical"]
    },
    {
      id: 3,
      title: "Client presentation preparation",
      project: "Marketing Campaign",
      priority: "high",
      dueDate: "2024-02-19",
      status: "pending",
      completed: false,
      description: "Prepare slides and demo for upcoming client meeting",
      tags: ["client", "presentation"]
    },
    {
      id: 4,
      title: "Team meeting notes",
      project: "Infrastructure",
      priority: "low",
      dueDate: "2024-02-18",
      status: "completed",
      completed: true,
      description: "Document action items from weekly team sync",
      tags: ["meeting", "internal"]
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    priority: "medium",
    dueDate: "",
    description: "",
    tags: [] as string[],
    tagInput: ""
  });

  const handleOpenDialog = (task?: typeof tasks[0]) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        project: task.project,
        priority: task.priority,
        dueDate: task.dueDate,
        description: task.description || "",
        tags: task.tags || [],
        tagInput: ""
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        project: "",
        priority: "medium",
        dueDate: "",
        description: "",
        tags: [],
        tagInput: ""
      });
    }
    setDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!formData.title || !formData.project || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { tagInput, ...taskData } = formData;
    
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskData, status: t.status, completed: t.completed }
          : t
      ));
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } else {
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        ...taskData,
        status: "pending",
        completed: false,
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    }
    setDialogOpen(false);
  };

  const handleToggleTask = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: !t.completed, status: !t.completed ? "completed" : "pending" }
        : t
    ));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    setDeleteTaskId(null);
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ""
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const projects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.project)));
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Project filter
    if (filterProject !== "all") {
      filtered = filtered.filter(t => t.project === filterProject);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        case "project":
          return a.project.localeCompare(b.project);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, searchQuery, filterProject, filterPriority, sortBy]);

  const pendingTasks = filteredAndSortedTasks.filter(t => !t.completed);
  const completedTasks = filteredAndSortedTasks.filter(t => t.completed);

  const hasActiveFilters = searchQuery || filterProject !== "all" || filterPriority !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterProject("all");
    setFilterPriority("all");
  };

  return (
    <div className="flex-1 w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={100} minSize={50}>
          <div className="h-full p-6 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
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
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Tasks
                  </h1>
                  <p className="text-muted-foreground mt-1">Manage and track your daily tasks</p>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter task title"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter task description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Input
                          id="project"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          placeholder="Enter project name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          value={formData.tagInput}
                          onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Add tag and press Enter"
                        />
                        <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag, index) => (
                            <Button
                              key={index}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRemoveTag(tag)}
                              className="gap-1"
                            >
                              {tag}
                              <X className="h-3 w-3" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTask} className="bg-gradient-to-r from-primary to-primary/80">
                      {editingTask ? "Save Changes" : "Create Task"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <TaskStats tasks={tasks} />

            {/* Search and Filters */}
            <Card className="bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant={showFilters ? "default" : "outline"}
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                        <SelectItem value="priority">Sort by Priority</SelectItem>
                        <SelectItem value="project">Sort by Project</SelectItem>
                        <SelectItem value="title">Sort by Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showFilters && (
                    <div className="flex gap-2 pt-2 border-t animate-fade-in">
                      <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project} value={project}>{project}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>

                      {hasActiveFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="gap-2">
                          <X className="h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="gap-2">
                  All Tasks
                  <span className="text-xs opacity-70">({filteredAndSortedTasks.length})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  <span className="text-xs opacity-70">({pendingTasks.length})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  Completed
                  <span className="text-xs opacity-70">({completedTasks.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {filteredAndSortedTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        {hasActiveFilters ? "No tasks match your filters" : "No tasks yet. Create your first task!"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleOpenDialog}
                      onDelete={(id) => setDeleteTaskId(id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No pending tasks</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleOpenDialog}
                      onDelete={(id) => setDeleteTaskId(id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3">
                {completedTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No completed tasks</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleOpenDialog}
                      onDelete={(id) => setDeleteTaskId(id)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTaskId !== null} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTaskId && handleDeleteTask(deleteTaskId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
