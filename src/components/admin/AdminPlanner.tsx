import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, subWeeks, startOfDay, endOfDay, eachDayOfInterval, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ListTodo, BarChart3, Target, Clock, Layers, Bell } from "lucide-react";

import { PlannerKPICards } from "./planner/PlannerKPICards";
import { PlannerItemsTable, type PlannerItem } from "./planner/PlannerItemsTable";
import { PlannerItemEditor } from "./planner/PlannerItemEditor";
import { PlannerAIAssistant } from "./planner/PlannerAIAssistant";
import { PlannerPerformanceCharts } from "./planner/PlannerPerformanceCharts";
import { PlannerTimeWidget } from "./planner/PlannerTimeWidget";
import { PlannerTargetsTab } from "./planner/PlannerTargetsTab";
import { PlannerTimeBlockedView } from "./planner/PlannerTimeBlockedView";
import { PlannerDailyKPIOverlay } from "./planner/PlannerDailyKPIOverlay";
import { PlannerNotificationsPanel } from "./planner/PlannerNotificationsPanel";

export function AdminPlanner() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlannerItem | null>(null);
  
  // KPI Data
  const [kpiData, setKpiData] = useState({
    totalActiveTasks: 0,
    openApplications: 0,
    completedThisWeek: 0,
    completedToday: 0,
    timeSpentToday: { hours: 0, minutes: 0 },
    productivityScore: 0,
  });

  // Time tracking data
  const [timeThisWeek, setTimeThisWeek] = useState(0);
  const [timeLastWeek, setTimeLastWeek] = useState(0);

  // Chart data
  const [timeData, setTimeData] = useState<{ date: string; minutes: number }[]>([]);
  const [taskCompletionData, setTaskCompletionData] = useState<{ date: string; completed: number }[]>([]);
  const [applicationFunnel, setApplicationFunnel] = useState<{ status: string; count: number; color: string }[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_planner_items")
        .select(`
          id, item_name, item_type, crm_contact_id, status, priority, target_date, outcome_notes, description, created_at,
          crm_contacts:crm_contact_id (
            name, company
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedItems: PlannerItem[] = (data || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        item_type: item.item_type,
        crm_contact_id: item.crm_contact_id,
        crm_contact_name: item.crm_contacts?.company || item.crm_contacts?.name || null,
        status: item.status,
        priority: item.priority,
        target_date: item.target_date,
        outcome_notes: item.outcome_notes,
        description: item.description,
        created_at: item.created_at,
      }));

      setItems(mappedItems);
      calculateKPIs(mappedItems);
      calculateApplicationFunnel(mappedItems);
    } catch (error: any) {
      console.error("Error fetching planner items:", error);
      toast.error("Failed to load planner items");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

      // Fetch today's time
      const { data: todayData } = await supabase
        .from("admin_time_daily")
        .select("total_seconds")
        .eq("user_id", user.id)
        .eq("date", format(today, "yyyy-MM-dd"))
        .single();

      const todaySeconds = todayData?.total_seconds || 0;
      
      // Also check active session
      const { data: activeSession } = await supabase
        .from("admin_time_sessions")
        .select("start_time")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      let activeSeconds = 0;
      if (activeSession) {
        activeSeconds = Math.floor(
          (new Date().getTime() - new Date(activeSession.start_time).getTime()) / 1000
        );
      }

      const totalTodaySeconds = todaySeconds + activeSeconds;
      const hours = Math.floor(totalTodaySeconds / 3600);
      const minutes = Math.floor((totalTodaySeconds % 3600) / 60);

      // Fetch this week's time
      const { data: thisWeekData } = await supabase
        .from("admin_time_daily")
        .select("total_seconds")
        .eq("user_id", user.id)
        .gte("date", format(weekStart, "yyyy-MM-dd"))
        .lte("date", format(weekEnd, "yyyy-MM-dd"));

      const thisWeekTotal = (thisWeekData || []).reduce((sum, d) => sum + (d.total_seconds || 0), 0) + activeSeconds;

      // Fetch last week's time
      const { data: lastWeekData } = await supabase
        .from("admin_time_daily")
        .select("total_seconds")
        .eq("user_id", user.id)
        .gte("date", format(lastWeekStart, "yyyy-MM-dd"))
        .lte("date", format(lastWeekEnd, "yyyy-MM-dd"));

      const lastWeekTotal = (lastWeekData || []).reduce((sum, d) => sum + (d.total_seconds || 0), 0);

      setKpiData(prev => ({
        ...prev,
        timeSpentToday: { hours, minutes },
      }));
      setTimeThisWeek(thisWeekTotal);
      setTimeLastWeek(lastWeekTotal);

      // Fetch time chart data (last 7 days)
      const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      });

      const { data: chartData } = await supabase
        .from("admin_time_daily")
        .select("date, total_seconds")
        .eq("user_id", user.id)
        .gte("date", format(subDays(today, 6), "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"));

      const chartMap = new Map((chartData || []).map(d => [d.date, d.total_seconds]));
      
      const timeChartData = last7Days.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        const seconds = (chartMap.get(dateStr) || 0) + (isToday ? activeSeconds : 0);
        return {
          date: format(day, "EEE"),
          minutes: Math.round(seconds / 60),
        };
      });

      setTimeData(timeChartData);
    } catch (error) {
      console.error("Error fetching time data:", error);
    }
  }, []);

  const fetchTaskCompletionData = useCallback(async () => {
    try {
      const today = new Date();
      const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      });

      // Get completed items with dates
      const { data } = await supabase
        .from("admin_planner_items")
        .select("updated_at")
        .eq("status", "completed");

      const completionMap = new Map<string, number>();
      (data || []).forEach(item => {
        const dateStr = format(new Date(item.updated_at), "yyyy-MM-dd");
        completionMap.set(dateStr, (completionMap.get(dateStr) || 0) + 1);
      });

      const chartData = last7Days.map(day => ({
        date: format(day, "EEE"),
        completed: completionMap.get(format(day, "yyyy-MM-dd")) || 0,
      }));

      setTaskCompletionData(chartData);
    } catch (error) {
      console.error("Error fetching task completion data:", error);
    }
  }, []);

  const calculateKPIs = (plannerItems: PlannerItem[]) => {
    const activeTasks = plannerItems.filter(
      i => i.item_type === 'task' && !['completed', 'rejected'].includes(i.status)
    ).length;

    const openApps = plannerItems.filter(
      i => i.item_type === 'job_application' && !['completed', 'rejected', 'offer'].includes(i.status)
    ).length;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // Count items completed this week (based on updated_at for when status changed to completed)
    const completedThisWeek = plannerItems.filter(i => 
      i.status === 'completed' && 
      new Date(i.created_at) >= weekStart
    ).length;

    // Count items completed today
    const completedToday = plannerItems.filter(i => 
      i.status === 'completed' && 
      new Date(i.created_at) >= todayStart
    ).length;

    // Calculate productivity score (simple formula)
    const totalItems = plannerItems.length;
    const completedItems = plannerItems.filter(i => i.status === 'completed').length;
    const productivityScore = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100) 
      : 0;

    setKpiData(prev => ({
      ...prev,
      totalActiveTasks: activeTasks,
      openApplications: openApps,
      completedThisWeek,
      completedToday,
      productivityScore,
    }));
  };

  const calculateApplicationFunnel = (plannerItems: PlannerItem[]) => {
    const apps = plannerItems.filter(i => i.item_type === 'job_application');
    
    const statusCounts = {
      'Applied': apps.filter(a => a.status === 'todo').length,
      'In Progress': apps.filter(a => a.status === 'in_progress').length,
      'Waiting': apps.filter(a => a.status === 'waiting').length,
      'Offer': apps.filter(a => a.status === 'offer').length,
      'Rejected': apps.filter(a => a.status === 'rejected').length,
    };

    const funnel = [
      { status: 'Applied', count: statusCounts['Applied'], color: 'hsl(var(--primary))' },
      { status: 'In Progress', count: statusCounts['In Progress'], color: '#3b82f6' },
      { status: 'Waiting', count: statusCounts['Waiting'], color: '#f59e0b' },
      { status: 'Offer', count: statusCounts['Offer'], color: '#10b981' },
      { status: 'Rejected', count: statusCounts['Rejected'], color: '#ef4444' },
    ];

    setApplicationFunnel(funnel);
  };

  const handleItemClick = (item: PlannerItem) => {
    setSelectedItem(item);
    setEditorOpen(true);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setEditorOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_planner_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Item deleted");
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTimeData();
    fetchTaskCompletionData();

    // Refresh time data every minute
    const interval = setInterval(fetchTimeData, 60000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchTimeData, fetchTaskCompletionData]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <PlannerKPICards
        totalActiveTasks={kpiData.totalActiveTasks}
        openApplications={kpiData.openApplications}
        completedThisWeek={kpiData.completedThisWeek}
        timeSpentToday={kpiData.timeSpentToday}
        productivityScore={kpiData.productivityScore}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="time-blocks" className="gap-2">
            <Clock className="h-4 w-4" />
            Time Blocks
          </TabsTrigger>
          <TabsTrigger value="daily-kpi" className="gap-2">
            <Layers className="h-4 w-4" />
            Daily KPIs
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks & Applications
          </TabsTrigger>
          <TabsTrigger value="targets" className="gap-2">
            <Target className="h-4 w-4" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Assistant */}
            <div className="lg:col-span-2">
              <PlannerAIAssistant
                items={items}
                timeToday={kpiData.timeSpentToday}
                timeThisWeek={timeThisWeek}
              />
            </div>

            {/* Notifications Panel */}
            <div>
              <PlannerNotificationsPanel items={items} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Tasks Table */}
            <div className="lg:col-span-2">
              <PlannerItemsTable
                items={items.slice(0, 5)}
                onItemClick={handleItemClick}
                onAddItem={handleAddItem}
                loading={loading}
              />
            </div>

            {/* Time Widget */}
            <div>
              <PlannerTimeWidget
                today={kpiData.timeSpentToday}
                thisWeek={timeThisWeek}
                lastWeek={timeLastWeek}
              />
            </div>
          </div>
        </TabsContent>

        {/* Time Blocked Execution View Tab */}
        <TabsContent value="time-blocks">
          <PlannerTimeBlockedView 
            items={items} 
            onItemClick={handleItemClick}
          />
        </TabsContent>

        {/* Daily KPI Overlay Tab */}
        <TabsContent value="daily-kpi">
          <PlannerDailyKPIOverlay 
            items={items}
            timeData={timeData}
          />
        </TabsContent>

        {/* Tasks & Applications Tab */}
        <TabsContent value="items">
          <PlannerItemsTable
            items={items}
            onItemClick={handleItemClick}
            onAddItem={handleAddItem}
            loading={loading}
          />
        </TabsContent>

        {/* Targets Tab */}
        <TabsContent value="targets">
          <PlannerTargetsTab />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <PlannerPerformanceCharts
            timeData={timeData}
            taskCompletionData={taskCompletionData}
            applicationFunnel={applicationFunnel}
            dailyTarget={5}
            dailyActual={kpiData.completedToday}
            weeklyTaskTarget={20}
            weeklyTaskActual={kpiData.completedThisWeek}
            timeOnPlatformTarget={40}
            timeOnPlatformActual={timeThisWeek / 3600}
          />
        </TabsContent>
      </Tabs>

      {/* Item Editor Side Panel */}
      <PlannerItemEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        item={selectedItem}
        onSave={fetchItems}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
