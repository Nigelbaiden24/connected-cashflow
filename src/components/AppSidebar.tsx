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
  Zap,
  Globe,
  Lightbulb,
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

const researchToolsItems = [
  {
    title: "Market Commentary",
    url: "/finance/commentary",
    icon: TrendingUp,
  },
  {
    title: "Model Portfolios",
    url: "/finance/portfolios",
    icon: Briefcase,
  },
  {
    title: "Benchmarking & Trends",
    url: "/finance/trends",
    icon: Activity,
  },
  {
    title: "AI Analyst",
    url: "/finance/ai-analyst",
    icon: Bot,
  },
  {
    title: "Watchlists",
    url: "/finance/watchlists",
    icon: FolderKanban,
  },
  {
    title: "Screeners & Discovery",
    url: "/finance/screeners",
    icon: Zap,
  },
  {
    title: "Fund & ETF Database",
    url: "/finance/fund-database",
    icon: BarChart3,
  },
  {
    title: "Opportunity Intelligence",
    url: "/finance/opportunities",
    icon: Lightbulb,
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
      ? "bg-white/20 text-white font-medium shadow-lg backdrop-blur-sm border border-white/20"
      : "text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300";
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
      className={`${isCollapsed ? "w-16" : "w-64"} border-r-0`}
      collapsible="icon"
      style={{
        background: "linear-gradient(180deg, hsl(221 83% 45%) 0%, hsl(221 83% 35%) 50%, hsl(221 83% 25%) 100%)",
      }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 right-0 w-48 h-48 bg-white/3 rounded-full blur-3xl" />
      </div>

      <SidebarHeader className="border-b border-white/10 relative z-10">
        <div className={`flex items-center gap-3 px-4 py-4 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <TranslatedText as="span" className="text-base font-bold text-white tracking-tight">FlowPulse.io</TranslatedText>
              <TranslatedText as="span" className="text-xs text-white/60 font-medium">Wealth Platform</TranslatedText>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 px-2">
        <TooltipProvider>
          <SidebarGroup className="mt-4">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>AI Tools</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiToolsItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 w-10 mx-auto rounded-xl">
                            <NavLink to={item.url} className={`${getNavClassName(item.url)} rounded-xl flex items-center justify-center`}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-background text-white border-white/20">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink 
                          to={item.url} 
                          className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <item.icon className="h-4 w-4 flex-shrink-0 text-white" />
                          </div>
                          <TranslatedText as="span" className="truncate font-medium text-sm">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>Research & Analysis</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {researchToolsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 w-10 mx-auto rounded-xl">
                            <NavLink to={item.url} className={`${getNavClassName(item.url)} rounded-xl flex items-center justify-center`}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-background text-white border-white/20">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink 
                          to={item.url} 
                          className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <item.icon className="h-4 w-4 flex-shrink-0 text-white" />
                          </div>
                          <TranslatedText as="span" className="truncate font-medium text-sm">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>Financial Planning</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {financialPlanningItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 w-10 mx-auto rounded-xl">
                            <NavLink to={item.url} className={`${getNavClassName(item.url)} rounded-xl flex items-center justify-center`}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-background text-white border-white/20">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink 
                          to={item.url} 
                          className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <item.icon className="h-4 w-4 flex-shrink-0 text-white" />
                          </div>
                          <TranslatedText as="span" className="truncate font-medium text-sm">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>Practice Management</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {practiceManagementItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 w-10 mx-auto rounded-xl">
                            <NavLink to={item.url} className={`${getNavClassName(item.url)} rounded-xl flex items-center justify-center`}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-background text-white border-white/20">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink 
                          to={item.url} 
                          className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <item.icon className="h-4 w-4 flex-shrink-0 text-white" />
                          </div>
                          <TranslatedText as="span" className="truncate font-medium text-sm">{item.title}</TranslatedText>
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
                        <SidebarMenuButton asChild className="justify-center h-10 w-10 mx-auto rounded-xl">
                          <NavLink to="/finance/languages" className={`${getNavClassName("/finance/languages")} rounded-xl flex items-center justify-center`}>
                            <Globe className="h-5 w-5 flex-shrink-0" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-sidebar-background text-white border-white/20">
                        <TranslatedText as="p">Languages</TranslatedText>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink to="/finance/languages" className={`${getNavClassName("/finance/languages")} flex items-center gap-3 px-3 py-2 rounded-xl`}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                          <Globe className="h-4 w-4 flex-shrink-0 text-white" />
                        </div>
                        <TranslatedText as="span" className="truncate font-medium text-sm">Languages</TranslatedText>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 relative z-10">
        <div className={`p-4 space-y-3 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/40 to-white/20 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <Avatar className="relative h-9 w-9 flex-shrink-0 ring-2 ring-white/20">
                <AvatarFallback className="text-xs bg-white/20 text-white font-bold backdrop-blur-sm">
                  {getUserInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-sm font-medium text-white truncate">{userEmail}</span>
                <TranslatedText as="span" className="text-xs text-white/50 truncate">FlowPulse Advisor</TranslatedText>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
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