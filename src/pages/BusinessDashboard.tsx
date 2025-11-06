import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Calendar,
  FileText,
  Target,
  Activity,
  Briefcase,
  MessageSquare,
  Settings,
  PieChart,
  Home,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

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

  const metrics = [
    { title: "Total Revenue", value: "£245,000", change: "+12.5%", icon: DollarSign, trend: "up" },
    { title: "Active Projects", value: "23", change: "+3", icon: Briefcase, trend: "up" },
    { title: "Team Members", value: "45", change: "+5", icon: Users, trend: "up" },
    { title: "Customer Satisfaction", value: "94%", change: "+2%", icon: Target, trend: "up" },
  ];

  const recentActivities = [
    { title: "New project started", description: "Website Redesign Project", time: "2 hours ago" },
    { title: "Team meeting scheduled", description: "Q4 Planning Session", time: "4 hours ago" },
    { title: "Invoice sent", description: "Project Alpha - Final Payment", time: "Yesterday" },
    { title: "New client onboarded", description: "TechStart Solutions Ltd", time: "2 days ago" },
  ];

  const quickActions = [
    { title: "Create Project", icon: Briefcase, description: "Start a new project", path: "/projects" },
    { title: "Add Client", icon: Users, description: "Onboard a new client", path: "/onboarding" },
    { title: "Generate Report", icon: FileText, description: "Create business report", path: "/business-ai-generator" },
    { title: "Schedule Meeting", icon: Calendar, description: "Plan team meeting", path: "/calendar" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
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
                  <h1 className="text-2xl font-bold">Business Dashboard</h1>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to Flowpulse Business</h2>
              <p className="text-green-100">Your all-in-one business management platform</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{metric.change}</span>
                      <span>from last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto flex-col items-start p-4 hover:bg-accent"
                      onClick={() => navigate(action.path)}
                    >
                      <action.icon className="h-6 w-6 mb-2 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Overview</CardTitle>
                  <CardDescription>Key business insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-primary" />
                        <span className="text-sm">Projects Completion</span>
                      </div>
                      <Badge variant="outline">87%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Revenue Growth</span>
                      </div>
                      <Badge variant="outline">+15.3%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Client Retention</span>
                      </div>
                      <Badge variant="outline">92%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm">Goal Achievement</span>
                      </div>
                      <Badge variant="outline">78%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Hub */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>Stay connected with your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Team Chat & Collaboration</p>
                      <p className="text-sm text-muted-foreground">5 unread messages</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/team-chat')}>Open Chat</Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
