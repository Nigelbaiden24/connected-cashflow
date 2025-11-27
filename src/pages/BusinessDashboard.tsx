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
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <img
                src={flowpulseLogo} 
                alt="The Flowpulse Group" 
                className="h-14 w-14 rounded-lg object-contain cursor-pointer" 
                onClick={() => navigate('/')}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <h1 className="text-2xl font-bold"><TranslatedText>Business Dashboard</TranslatedText></h1>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground shadow-lg">
              <h2 className="text-3xl font-bold mb-2"><TranslatedText>Welcome to Flowpulse Business Command Center</TranslatedText></h2>
              <p className="text-primary-foreground/90"><TranslatedText>Your enterprise-grade business automation platform</TranslatedText></p>
            </div>

            {/* Global Workload Summary */}
            <WorkloadSummary />

            {/* Command Center */}
            <CommandCenter />

            {/* Smart Recommendations + Activity Feed */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SmartRecommendations />
              <ActivityFeed />
            </div>

            {/* Performance Metrics */}
            <PerformanceMetrics />

            {/* Project Health + Workload Heatmap */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ProjectHealthGrid />
              <WorkloadHeatmap />
            </div>

            {/* Automation Monitoring */}
            <AutomationMonitoring />

            {/* Notifications + Document Hub */}
            <div className="grid gap-6 lg:grid-cols-2">
              <NotificationsCenter />
              <DocumentHub />
            </div>

            {/* Deadlines Timeline + Time Tracking */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DeadlinesTimeline />
              <TimeTrackingSnapshot />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
