import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  FileText,
  Settings,
  LogOut,
  Bot,
  PieChart,
  Target,
  Calculator,
  BarChart3,
  AlertTriangle,
  UserPlus,
  Briefcase,
  Activity,
  Sparkles,
  Calendar,
  Mail,
  ChevronRight,
  User,
  Bell,
  Palette,
  UserCog,
  History,
  FolderKanban,
  ClipboardList,
  Zap,
} from "lucide-react";

interface AppSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

const aiToolsItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Document Generator",
    url: "/finance-ai-generator",
    icon: Sparkles,
  },
  {
    title: "Market Data",
    url: "/market",
    icon: TrendingUp,
  },
];

const financialPlanningItems = [
  {
    title: "Financial Planning",
    url: "/financial-planning",
    icon: Calculator,
  },
  {
    title: "Portfolio Management",
    url: "/portfolio",
    icon: PieChart,
  },
  {
    title: "Goal Planning",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Investment Analysis",
    url: "/investments",
    icon: BarChart3,
  },
  {
    title: "Risk Assessment",
    url: "/risk",
    icon: AlertTriangle,
  },
  {
    title: "Scenario Analysis",
    url: "/scenario",
    icon: Activity,
  },
];

const practiceManagementItems = [
  {
    title: "CRM",
    url: "/finance-crm",
    icon: Users,
  },
  {
    title: "Client Management",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Client Onboarding",
    url: "/onboarding",
    icon: UserPlus,
  },
  {
    title: "Practice Management",
    url: "/practice",
    icon: Briefcase,
  },
  {
    title: "Payroll",
    url: "/finance-payroll",
    icon: Calculator,
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: Shield,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
  },
  {
    title: "Automation Center",
    url: "/automation-center",
    icon: Activity,
  },
];

const settingsSubItems = [
  {
    title: "Profile",
    url: "/settings?tab=profile",
    icon: User,
  },
  {
    title: "Security",
    url: "/settings?tab=security",
    icon: Shield,
  },
  {
    title: "Notifications",
    url: "/settings?tab=notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    url: "/settings?tab=appearance",
    icon: Palette,
  },
  {
    title: "Account",
    url: "/settings?tab=account",
    icon: UserCog,
  },
  {
    title: "Activity",
    url: "/settings?tab=activity",
    icon: History,
  },
];

export function AppSidebar({ userEmail, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [settingsExpanded, setSettingsExpanded] = useState(
    location.pathname === "/settings"
  );

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [pathname, query] = path.split("?");
      return location.pathname === pathname && location.search.includes(query);
    }
    return location.pathname === path;
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50";
  };

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">FlowPulse.io</span>
              <span className="text-xs text-sidebar-foreground/70">Wealth Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <TooltipProvider>
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>AI Tools</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {aiToolsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Financial Planning</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {financialPlanningItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Practice Management</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {practiceManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
                
                {/* Settings with submenu */}
                <SidebarMenuItem>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => setSettingsExpanded(!settingsExpanded)}
                          className={getNavClassName("/settings")}
                        >
                          <Settings className="h-4 w-4" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <SidebarMenuButton
                        onClick={() => setSettingsExpanded(!settingsExpanded)}
                        className={getNavClassName("/settings")}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                        <ChevronRight
                          className={`ml-auto h-4 w-4 transition-transform ${
                            settingsExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                      {settingsExpanded && (
                        <SidebarMenuSub>
                          {settingsSubItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={getNavClassName(subItem.url)}
                                >
                                  <subItem.icon className="h-3 w-3" />
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {getUserInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{userEmail}</span>
                <span className="text-xs text-sidebar-foreground/70">FlowPulse Advisor</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}