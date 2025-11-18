import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Filter, Save, Star, StarOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FilterConfig {
  planType: string;
  riskTolerance: string;
  status: string;
  minTimeHorizon: string;
  maxTimeHorizon: string;
  minAUM: string;
  maxAUM: string;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterConfig) => void;
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterConfig>({
    planType: "all",
    riskTolerance: "all",
    status: "all",
    minTimeHorizon: "",
    maxTimeHorizon: "",
    minAUM: "",
    maxAUM: ""
  });
  const [savedViews, setSavedViews] = useState<any[]>([]);
  const [viewName, setViewName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    fetchSavedViews();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const fetchSavedViews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("plan_saved_views")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedViews(data || []);
    } catch (error: any) {
      console.error("Error fetching saved views:", error);
    }
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("plan_saved_views")
        .insert({
          user_id: user.id,
          view_name: viewName,
          filter_config: filters as any
        });

      if (error) throw error;

      toast.success("View saved");
      setViewName("");
      setIsSaveDialogOpen(false);
      fetchSavedViews();
    } catch (error: any) {
      toast.error("Failed to save view");
      console.error(error);
    }
  };

  const handleLoadView = (view: any) => {
    setFilters(view.filter_config);
    toast.success(`Loaded view: ${view.view_name}`);
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      const { error } = await supabase
        .from("plan_saved_views")
        .delete()
        .eq("id", viewId);

      if (error) throw error;
      toast.success("View deleted");
      fetchSavedViews();
    } catch (error: any) {
      toast.error("Failed to delete view");
      console.error(error);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      planType: "all",
      riskTolerance: "all",
      status: "all",
      minTimeHorizon: "",
      maxTimeHorizon: "",
      minAUM: "",
      maxAUM: ""
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "planType" || key === "riskTolerance" || key === "status") {
      return value !== "all";
    }
    return value !== "";
  }).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label>Plan Type</Label>
                <Select
                  value={filters.planType}
                  onValueChange={(value) => setFilters({ ...filters, planType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="tax">Tax Planning</SelectItem>
                    <SelectItem value="estate">Estate Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Risk Tolerance</Label>
                <Select
                  value={filters.riskTolerance}
                  onValueChange={(value) => setFilters({ ...filters, riskTolerance: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Horizon (years)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minTimeHorizon}
                    onChange={(e) => setFilters({ ...filters, minTimeHorizon: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxTimeHorizon}
                    onChange={(e) => setFilters({ ...filters, maxTimeHorizon: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>AUM Range (£)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAUM}
                    onChange={(e) => setFilters({ ...filters, minAUM: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAUM}
                    onChange={(e) => setFilters({ ...filters, maxAUM: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Current View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Filter View</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>View Name</Label>
                    <Input
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      placeholder="e.g., High-risk clients"
                    />
                  </div>
                  <Button onClick={handleSaveView} className="w-full">Save View</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>

      {savedViews.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Saved Views ({savedViews.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold">Saved Views</h4>
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => handleLoadView(view)}
                >
                  <span className="text-sm">{view.view_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}