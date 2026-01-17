import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, Search, Calendar, Building2, ClipboardList, Sparkles, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface PlannerItem {
  id: string;
  item_name: string;
  item_type: 'task' | 'job_application';
  crm_contact_id: string | null;
  crm_contact_name?: string;
  status: 'todo' | 'in_progress' | 'waiting' | 'completed' | 'rejected' | 'offer';
  priority: 'low' | 'medium' | 'high';
  target_date: string | null;
  outcome_notes: string | null;
  description: string | null;
  created_at: string;
}

interface PlannerItemsTableProps {
  items: PlannerItem[];
  onItemClick: (item: PlannerItem) => void;
  onAddItem: () => void;
  loading: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  todo: { 
    bg: "bg-slate-100 dark:bg-slate-800/50", 
    text: "text-slate-700 dark:text-slate-300", 
    border: "border-slate-200 dark:border-slate-700" 
  },
  in_progress: { 
    bg: "bg-blue-100 dark:bg-blue-900/30", 
    text: "text-blue-700 dark:text-blue-400", 
    border: "border-blue-200 dark:border-blue-800" 
  },
  waiting: { 
    bg: "bg-amber-100 dark:bg-amber-900/30", 
    text: "text-amber-700 dark:text-amber-400", 
    border: "border-amber-200 dark:border-amber-800" 
  },
  completed: { 
    bg: "bg-emerald-100 dark:bg-emerald-900/30", 
    text: "text-emerald-700 dark:text-emerald-400", 
    border: "border-emerald-200 dark:border-emerald-800" 
  },
  rejected: { 
    bg: "bg-red-100 dark:bg-red-900/30", 
    text: "text-red-700 dark:text-red-400", 
    border: "border-red-200 dark:border-red-800" 
  },
  offer: { 
    bg: "bg-purple-100 dark:bg-purple-900/30", 
    text: "text-purple-700 dark:text-purple-400", 
    border: "border-purple-200 dark:border-purple-800" 
  },
};

const priorityConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  low: { 
    bg: "bg-slate-50 dark:bg-slate-800/30", 
    text: "text-slate-600 dark:text-slate-400", 
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400" 
  },
  medium: { 
    bg: "bg-amber-50 dark:bg-amber-900/20", 
    text: "text-amber-600 dark:text-amber-400", 
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500" 
  },
  high: { 
    bg: "bg-red-50 dark:bg-red-900/20", 
    text: "text-red-600 dark:text-red-400", 
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500" 
  },
};

const typeLabels: Record<string, { label: string; icon: typeof ClipboardList }> = {
  task: { label: "Task", icon: ClipboardList },
  job_application: { label: "Application", icon: Building2 },
};

export function PlannerItemsTable({
  items,
  onItemClick,
  onAddItem,
  loading,
}: PlannerItemsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.crm_contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    const matchesType = typeFilter === "all" || item.item_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            Tasks & Applications
            <Badge variant="secondary" className="ml-2">
              {filteredItems.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none lg:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="job_application">Applications</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To-Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[110px] bg-background">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={onAddItem} size="sm" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">CRM Link</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold">Target Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading items...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-muted/50">
                        <ClipboardList className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">No items found</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Add Item" to create your first task or application
                        </p>
                      </div>
                      <Button onClick={onAddItem} variant="outline" size="sm" className="mt-2 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const TypeIcon = typeLabels[item.item_type]?.icon || ClipboardList;
                  const status = statusConfig[item.status] || statusConfig.todo;
                  const priority = priorityConfig[item.priority] || priorityConfig.medium;
                  
                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-primary transition-colors">{item.item_name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal gap-1.5">
                          <TypeIcon className="h-3 w-3" />
                          {typeLabels[item.item_type]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.crm_contact_name ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{item.crm_contact_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border font-medium", status.bg, status.text, status.border)}>
                          {item.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", priority.dot)} />
                          <span className={cn("text-sm font-medium", priority.text)}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.target_date ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{format(new Date(item.target_date), "MMM d, yyyy")}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
