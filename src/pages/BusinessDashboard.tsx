import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { WorkloadSummary } from "@/components/business/WorkloadSummary";
import { CommandCenter } from "@/components/business/CommandCenter";
import { ActivityFeed } from "@/components/business/ActivityFeed";
import { SmartRecommendations } from "@/components/business/SmartRecommendations";
import { WorkloadHeatmap } from "@/components/business/WorkloadHeatmap";
import { ProjectHealthGrid } from "@/components/business/ProjectHealthGrid";
import { AutomationMonitoring } from "@/components/business/AutomationMonitoring";
import { PerformanceMetrics } from "@/components/business/PerformanceMetrics";
import { NotificationsCenter } from "@/components/business/NotificationsCenter";
import { DocumentHub } from "@/components/business/DocumentHub";
import { DeadlinesTimeline } from "@/components/business/DeadlinesTimeline";
import { TimeTrackingSnapshot } from "@/components/business/TimeTrackingSnapshot";
import { TranslatedText } from "@/components/TranslatedText";
import { Badge } from "@/components/ui/badge";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail] = useState("business@flowpulse.io");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col w-full">
          <header className="sticky top-0 z-40 border-b border-border bg-background">
            <div className="flex h-14 items-center gap-3 px-6">
              <img
                src={flowpulseLogo} 
                alt="The Flowpulse Group" 
                className="h-10 w-10 rounded-lg object-contain cursor-pointer" 
                onClick={() => navigate('/')}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <h1 className="text-lg font-semibold"><TranslatedText>Business Dashboard</TranslatedText></h1>
                </div>
              </div>
              <Badge variant="outline" className="text-xs gap-1.5 border-emerald-500/30 text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <TranslatedText>Live</TranslatedText>
              </Badge>
            </div>
          </header>

          <main className="flex-1 w-full space-y-5 p-6 bg-background overflow-auto">
            {/* Welcome Banner - Clean */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  <TranslatedText>Command Center</TranslatedText>
                </h2>
                <p className="text-sm text-muted-foreground">
                  <TranslatedText>Here's a snapshot of your business operations</TranslatedText>
                </p>
              </div>
            </div>

            {/* Global Workload Summary */}
            <WorkloadSummary />

            {/* Command Center */}
            <CommandCenter />

            {/* Performance Metrics */}
            <PerformanceMetrics />

            {/* Smart Recommendations + Activity Feed */}
            <div className="grid gap-4 lg:grid-cols-2">
              <SmartRecommendations />
              <ActivityFeed />
            </div>

            {/* Project Health + Workload Heatmap */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ProjectHealthGrid />
              <WorkloadHeatmap />
            </div>

            {/* Automation Monitoring */}
            <AutomationMonitoring />

            {/* Notifications + Document Hub */}
            <div className="grid gap-4 lg:grid-cols-2">
              <NotificationsCenter />
              <DocumentHub />
            </div>

            {/* Deadlines Timeline + Time Tracking */}
            <div className="grid gap-4 lg:grid-cols-2">
              <DeadlinesTimeline />
              <TimeTrackingSnapshot />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
