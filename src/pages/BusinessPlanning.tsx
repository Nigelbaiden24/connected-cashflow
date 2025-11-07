import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, DollarSign, BarChart3, FileText, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BusinessPlanning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [goals, setGoals] = useState([
    { id: 1, name: "Revenue Growth", target: 1000000, current: 750000, unit: "£" },
    { id: 2, name: "Customer Acquisition", target: 500, current: 380, unit: "" },
    { id: 3, name: "Market Share", target: 15, current: 11, unit: "%" },
    { id: 4, name: "Team Expansion", target: 50, current: 42, unit: " people" },
  ]);

  const [initiatives, setInitiatives] = useState([
    { id: 1, name: "Product Expansion", description: "Launch 3 new product lines", progress: 60, deadline: "Q2 2024", status: "in-progress" },
    { id: 2, name: "Market Penetration", description: "Enter 2 new regional markets", progress: 45, deadline: "Q3 2024", status: "in-progress" },
    { id: 3, name: "Digital Transformation", description: "Modernize core systems", progress: 75, deadline: "Q4 2024", status: "in-progress" },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [editInitiativeDialogOpen, setEditInitiativeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<typeof initiatives[0] | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "",
    unit: "£",
  });

  const [initiativeFormData, setInitiativeFormData] = useState({
    name: "",
    description: "",
    progress: "0",
    deadline: "",
    status: "in-progress",
  });

  const handleSaveGoal = () => {
    if (!formData.name || !formData.target || !formData.current) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newGoal = {
      id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
      name: formData.name,
      target: parseFloat(formData.target),
      current: parseFloat(formData.current),
      unit: formData.unit,
    };
    setGoals([...goals, newGoal]);
    toast({
      title: "Success",
      description: "Goal created successfully",
    });
    setDialogOpen(false);
    setFormData({ name: "", target: "", current: "", unit: "£" });
  };

  const handleUpdateGoal = () => {
    if (!selectedGoal || !formData.name || !formData.target || !formData.current) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setGoals(goals.map(g => 
      g.id === selectedGoal.id 
        ? { ...g, name: formData.name, target: parseFloat(formData.target), current: parseFloat(formData.current), unit: formData.unit }
        : g
    ));
    toast({
      title: "Success",
      description: "Goal updated successfully",
    });
    setEditDialogOpen(false);
    setSelectedGoal(null);
    setFormData({ name: "", target: "", current: "", unit: "£" });
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
    toast({
      title: "Success",
      description: "Goal deleted successfully",
    });
    setEditDialogOpen(false);
    setSelectedGoal(null);
  };

  const handleEditGoal = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      target: goal.target.toString(),
      current: goal.current.toString(),
      unit: goal.unit,
    });
    setEditDialogOpen(true);
  };

  const handleSaveInitiative = () => {
    if (!initiativeFormData.name || !initiativeFormData.description || !initiativeFormData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newInitiative = {
      id: initiatives.length > 0 ? Math.max(...initiatives.map(i => i.id)) + 1 : 1,
      name: initiativeFormData.name,
      description: initiativeFormData.description,
      progress: parseFloat(initiativeFormData.progress),
      deadline: initiativeFormData.deadline,
      status: initiativeFormData.status,
    };
    setInitiatives([...initiatives, newInitiative]);
    toast({
      title: "Success",
      description: "Strategic initiative created successfully",
    });
    setInitiativeDialogOpen(false);
    setInitiativeFormData({ name: "", description: "", progress: "0", deadline: "", status: "in-progress" });
  };

  const handleUpdateInitiative = () => {
    if (!selectedInitiative || !initiativeFormData.name || !initiativeFormData.description || !initiativeFormData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setInitiatives(initiatives.map(i => 
      i.id === selectedInitiative.id 
        ? { 
            ...i, 
            name: initiativeFormData.name, 
            description: initiativeFormData.description,
            progress: parseFloat(initiativeFormData.progress),
            deadline: initiativeFormData.deadline,
            status: initiativeFormData.status
          }
        : i
    ));
    toast({
      title: "Success",
      description: "Strategic initiative updated successfully",
    });
    setEditInitiativeDialogOpen(false);
    setSelectedInitiative(null);
    setInitiativeFormData({ name: "", description: "", progress: "0", deadline: "", status: "in-progress" });
  };

  const handleDeleteInitiative = (id: number) => {
    setInitiatives(initiatives.filter(i => i.id !== id));
    toast({
      title: "Success",
      description: "Strategic initiative deleted successfully",
    });
    setEditInitiativeDialogOpen(false);
    setSelectedInitiative(null);
  };

  const handleEditInitiative = (initiative: typeof initiatives[0]) => {
    setSelectedInitiative(initiative);
    setInitiativeFormData({
      name: initiative.name,
      description: initiative.description,
      progress: initiative.progress.toString(),
      deadline: initiative.deadline,
      status: initiative.status,
    });
    setEditInitiativeDialogOpen(true);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">Business Planning</h1>
            <p className="text-muted-foreground">Strategic planning and goal tracking</p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue Goal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£1M</div>
            <p className="text-xs text-muted-foreground">75% achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 on track</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Initiatives</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Goals & Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {goal.unit === "£" ? "£" : ""}{goal.current.toLocaleString()}{goal.unit !== "£" ? goal.unit : ""} / {goal.unit === "£" ? "£" : ""}{goal.target.toLocaleString()}{goal.unit !== "£" ? goal.unit : ""}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Strategic Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Business Plan 2024
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Market Analysis Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Competitive Strategy
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Growth Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Strategic Initiatives
            </CardTitle>
            <Button size="sm" onClick={() => setInitiativeDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Initiative
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {initiatives.map((initiative) => (
              <div key={initiative.id} className="space-y-2 p-4 border rounded-lg relative group">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{initiative.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditInitiative(initiative)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{initiative.description}</p>
                <Progress value={initiative.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{initiative.deadline}</p>
                  <span className="text-xs font-medium">{initiative.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter goal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="£ or % or people"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Value *</Label>
                <Input
                  id="current"
                  type="number"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Value *</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal}>Create Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Goal Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter goal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="£ or % or people"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-current">Current Value *</Label>
                <Input
                  id="edit-current"
                  type="number"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target">Target Value *</Label>
                <Input
                  id="edit-target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              variant="destructive" 
              onClick={() => selectedGoal && handleDeleteGoal(selectedGoal.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateGoal}>Update Goal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={initiativeDialogOpen} onOpenChange={setInitiativeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Strategic Initiative</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="initiative-name">Initiative Name *</Label>
              <Input
                id="initiative-name"
                value={initiativeFormData.name}
                onChange={(e) => setInitiativeFormData({ ...initiativeFormData, name: e.target.value })}
                placeholder="Enter initiative name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-description">Description *</Label>
              <Textarea
                id="initiative-description"
                value={initiativeFormData.description}
                onChange={(e) => setInitiativeFormData({ ...initiativeFormData, description: e.target.value })}
                placeholder="Describe the strategic initiative"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initiative-progress">Progress (%)</Label>
                <Input
                  id="initiative-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={initiativeFormData.progress}
                  onChange={(e) => setInitiativeFormData({ ...initiativeFormData, progress: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initiative-deadline">Deadline *</Label>
                <Input
                  id="initiative-deadline"
                  value={initiativeFormData.deadline}
                  onChange={(e) => setInitiativeFormData({ ...initiativeFormData, deadline: e.target.value })}
                  placeholder="Q1 2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-status">Status</Label>
              <Select value={initiativeFormData.status} onValueChange={(value) => setInitiativeFormData({ ...initiativeFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInitiativeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInitiative}>Create Initiative</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editInitiativeDialogOpen} onOpenChange={setEditInitiativeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Strategic Initiative</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-initiative-name">Initiative Name *</Label>
              <Input
                id="edit-initiative-name"
                value={initiativeFormData.name}
                onChange={(e) => setInitiativeFormData({ ...initiativeFormData, name: e.target.value })}
                placeholder="Enter initiative name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-initiative-description">Description *</Label>
              <Textarea
                id="edit-initiative-description"
                value={initiativeFormData.description}
                onChange={(e) => setInitiativeFormData({ ...initiativeFormData, description: e.target.value })}
                placeholder="Describe the strategic initiative"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-initiative-progress">Progress (%)</Label>
                <Input
                  id="edit-initiative-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={initiativeFormData.progress}
                  onChange={(e) => setInitiativeFormData({ ...initiativeFormData, progress: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-initiative-deadline">Deadline *</Label>
                <Input
                  id="edit-initiative-deadline"
                  value={initiativeFormData.deadline}
                  onChange={(e) => setInitiativeFormData({ ...initiativeFormData, deadline: e.target.value })}
                  placeholder="Q1 2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-initiative-status">Status</Label>
              <Select value={initiativeFormData.status} onValueChange={(value) => setInitiativeFormData({ ...initiativeFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              variant="destructive" 
              onClick={() => selectedInitiative && handleDeleteInitiative(selectedInitiative.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditInitiativeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateInitiative}>Update Initiative</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanning;
