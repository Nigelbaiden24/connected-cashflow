import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { TranslatedText } from "./TranslatedText";
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
  Globe,
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
    title: "AI Chatbot",
    url: "/theodore",
    icon: MessageSquare,
  },
  {
    title: "Tasks",
    url: "/finance/tasks",
    icon: ClipboardList,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
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
    url: "/finance/reports",
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


export function AppSidebar({ userEmail, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

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
      <Sidebar 
        className={`${isCollapsed ? "w-16" : "w-64"} border-r`}
        collapsible="icon"
      >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center gap-2 px-4 py-2 ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <TranslatedText as="span" className="text-sm font-semibold truncate">FlowPulse.io</TranslatedText>
              <TranslatedText as="span" className="text-xs text-sidebar-foreground/70 truncate">Wealth Platform</TranslatedText>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <TooltipProvider>
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel><TranslatedText>AI Tools</TranslatedText></SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {aiToolsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center">
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3`}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <TranslatedText as="span" className="truncate">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel><TranslatedText>Financial Planning</TranslatedText></SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {financialPlanningItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center">
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3`}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <TranslatedText as="span" className="truncate">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel><TranslatedText>Practice Management</TranslatedText></SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {practiceManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center">
                            <NavLink to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3`}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <TranslatedText as="span" className="truncate">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
                
                {/* Languages */}
                <SidebarMenuItem>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className="justify-center">
                          <NavLink to="/finance/languages" className={getNavClassName("/finance/languages")}>
                            <Globe className="h-4 w-4 flex-shrink-0" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <TranslatedText as="p">Languages</TranslatedText>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to="/finance/languages" className={`${getNavClassName("/finance/languages")} flex items-center gap-3`}>
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <TranslatedText as="span" className="truncate">Languages</TranslatedText>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={`p-4 space-y-3 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {getUserInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-sm font-medium truncate">{userEmail}</span>
                <TranslatedText as="span" className="text-xs text-sidebar-foreground/70 truncate">FlowPulse Advisor</TranslatedText>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <TranslatedText as="span" className="ml-2">Sign Out</TranslatedText>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}