import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Target,
  FileText,
  Calendar,
  Search,
  Filter
} from "lucide-react";

interface ProductivityLog {
  id: string;
  action_type: string;
  action_description: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: unknown;
  created_at: string;
}

const actionTypeIcons: Record<string, React.ReactNode> = {
  task_created: <Plus className="h-4 w-4 text-green-500" />,
  task_updated: <Edit className="h-4 w-4 text-blue-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  task_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  time_block_created: <Plus className="h-4 w-4 text-violet-500" />,
  time_block_updated: <Edit className="h-4 w-4 text-violet-500" />,
  time_block_completed: <CheckCircle2 className="h-4 w-4 text-violet-600" />,
  time_block_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  focus_started: <Play className="h-4 w-4 text-primary" />,
  focus_paused: <Pause className="h-4 w-4 text-amber-500" />,
  focus_ended: <Clock className="h-4 w-4 text-muted-foreground" />,
  target_created: <Target className="h-4 w-4 text-blue-500" />,
  target_updated: <Edit className="h-4 w-4 text-blue-500" />,
  target_achieved: <Target className="h-4 w-4 text-green-600" />,
  note_added: <FileText className="h-4 w-4 text-muted-foreground" />,
  session_started: <Play className="h-4 w-4 text-green-500" />,
  session_ended: <Clock className="h-4 w-4 text-muted-foreground" />,
  item_viewed: <Activity className="h-4 w-4 text-muted-foreground" />,
  report_uploaded: <FileText className="h-4 w-4 text-blue-500" />,
  calendar_event_created: <Calendar className="h-4 w-4 text-blue-500" />,
};

const actionTypeBadgeVariants: Record<string, string> = {
  task_created: "bg-green-500/10 text-green-600 border-green-500/30",
  task_updated: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  task_completed: "bg-green-600/10 text-green-700 border-green-600/30",
  task_deleted: "bg-red-500/10 text-red-600 border-red-500/30",
  time_block_created: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  time_block_updated: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  time_block_completed: "bg-violet-600/10 text-violet-700 border-violet-600/30",
  focus_started: "bg-primary/10 text-primary border-primary/30",
  focus_paused: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  target_achieved: "bg-green-600/10 text-green-700 border-green-600/30",
};

export function PlannerProductivityTab() {
  const [logs, setLogs] = useState<ProductivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<string>("7");

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = subDays(new Date(), parseInt(dateRange));
      
      const { data, error } = await supabase
        .from("admin_productivity_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfDay(startDate).toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching productivity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === "all" || log.action_type.startsWith(filter);
    const matchesSearch = searchQuery === "" || 
      log.action_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(new Date(log.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ProductivityLog[]>);

  const stats = {
    total: logs.length,
    tasks: logs.filter(l => l.action_type.startsWith("task")).length,
    timeBlocks: logs.filter(l => l.action_type.startsWith("time_block")).length,
    focus: logs.filter(l => l.action_type.startsWith("focus")).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tasks}</p>
                <p className="text-xs text-muted-foreground">Task Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.timeBlocks}</p>
                <p className="text-xs text-muted-foreground">Time Block Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Play className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.focus}</p>
                <p className="text-xs text-muted-foreground">Focus Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Detailed log of all your productivity actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="time_block">Time Blocks</SelectItem>
                <SelectItem value="focus">Focus Sessions</SelectItem>
                <SelectItem value="target">Targets</SelectItem>
                <SelectItem value="session">Sessions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading activity log...</p>
              </div>
            ) : Object.keys(groupedLogs).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No activity logged yet</p>
                <p className="text-sm text-muted-foreground/70">Your actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 mb-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        <Badge variant="secondary" className="ml-2">
                          {dayLogs.length} actions
                        </Badge>
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {dayLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-0.5">
                            {actionTypeIcons[log.action_type] || <Activity className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{log.action_description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${actionTypeBadgeVariants[log.action_type] || ""}`}
                              >
                                {log.action_type.replace(/_/g, " ")}
                              </Badge>
                              {log.entity_type && (
                                <span className="text-xs text-muted-foreground">
                                  {log.entity_type}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "h:mm a")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
