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
import { Badge } from "@/components/ui/badge";
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
  Crown,
  ChevronDown,
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
    badge: null,
  },
  {
    title: "AI Chatbot",
    url: "/theodore",
    icon: MessageSquare,
    badge: "AI",
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Document Generator",
    url: "/finance-ai-generator",
    icon: Sparkles,
    badge: "AI",
  },
  {
    title: "Market Data",
    url: "/market",
    icon: TrendingUp,
    badge: "Live",
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
      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-2 border-primary font-medium shadow-sm"
      : "hover:bg-muted/80 hover:text-foreground transition-all duration-200";
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

  const renderBadge = (badge: string | null) => {
    if (!badge) return null;
    
    if (badge === "AI") {
      return (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-600 border-violet-500/30">
          {badge}
        </Badge>
      );
    }
    if (badge === "Live") {
      return (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 border-emerald-500/30">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
          {badge}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
        {badge}
      </Badge>
    );
  };

  return (
    <Sidebar 
      className={`${isCollapsed ? "w-16" : "w-64"} border-r border-border/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950`}
      collapsible="icon"
    >
      {/* Premium Header */}
      <SidebarHeader className="border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
        <div className={`flex items-center gap-3 px-4 py-4 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
              <Bot className="h-5 w-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <TranslatedText as="span" className="text-base font-bold text-white tracking-tight">FlowPulse</TranslatedText>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  PRO
                </Badge>
              </div>
              <TranslatedText as="span" className="text-xs text-slate-400">Wealth Management Platform</TranslatedText>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <TooltipProvider>
          {/* AI Tools Section */}
          <SidebarGroup className="mb-2">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <TranslatedText>AI Tools</TranslatedText>
                </div>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiToolsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 rounded-lg">
                            <NavLink 
                              to={item.url} 
                              className={`${isActive(item.url) 
                                ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                              } transition-all duration-200`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink 
                          to={item.url} 
                          className={`${isActive(item.url) 
                            ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20 border-l-2 border-primary' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          } flex items-center gap-3 transition-all duration-200`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive(item.url) ? 'bg-primary/20' : 'bg-white/5'
                          }`}>
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <TranslatedText as="span" className="truncate text-sm">{item.title}</TranslatedText>
                          {renderBadge(item.badge)}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Divider */}
          <div className="mx-3 my-4 border-t border-white/5" />

          {/* Financial Planning Section */}
          <SidebarGroup className="mb-2">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="h-3 w-3" />
                  <TranslatedText>Financial Planning</TranslatedText>
                </div>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {financialPlanningItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 rounded-lg">
                            <NavLink 
                              to={item.url} 
                              className={`${isActive(item.url) 
                                ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                              } transition-all duration-200`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink 
                          to={item.url} 
                          className={`${isActive(item.url) 
                            ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20 border-l-2 border-primary' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          } flex items-center gap-3 transition-all duration-200`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive(item.url) ? 'bg-primary/20' : 'bg-white/5'
                          }`}>
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <TranslatedText as="span" className="truncate text-sm">{item.title}</TranslatedText>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Divider */}
          <div className="mx-3 my-4 border-t border-white/5" />

          {/* Practice Management Section */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3" />
                  <TranslatedText>Practice Management</TranslatedText>
                </div>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {practiceManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center h-10 rounded-lg">
                            <NavLink 
                              to={item.url} 
                              className={`${isActive(item.url) 
                                ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                              } transition-all duration-200`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink 
                          to={item.url} 
                          className={`${isActive(item.url) 
                            ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20 border-l-2 border-primary' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          } flex items-center gap-3 transition-all duration-200`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive(item.url) ? 'bg-primary/20' : 'bg-white/5'
                          }`}>
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <TranslatedText as="span" className="truncate text-sm">{item.title}</TranslatedText>
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
                        <SidebarMenuButton asChild className="justify-center h-10 rounded-lg">
                          <NavLink 
                            to="/finance/languages" 
                            className={`${isActive("/finance/languages") 
                              ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                            } transition-all duration-200`}
                          >
                            <Globe className="h-4 w-4 flex-shrink-0" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <TranslatedText as="p">Languages</TranslatedText>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild className="h-10 rounded-lg">
                      <NavLink 
                        to="/finance/languages" 
                        className={`${isActive("/finance/languages") 
                          ? 'bg-gradient-to-r from-primary/30 to-primary/20 text-white shadow-lg shadow-primary/20 border-l-2 border-primary' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        } flex items-center gap-3 transition-all duration-200`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive("/finance/languages") ? 'bg-primary/20' : 'bg-white/5'
                        }`}>
                          <Globe className="h-4 w-4 flex-shrink-0" />
                        </div>
                        <TranslatedText as="span" className="truncate text-sm">Languages</TranslatedText>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>

      {/* Premium Footer */}
      <SidebarFooter className="border-t border-white/10 bg-gradient-to-t from-slate-950 to-transparent">
        <div className={`p-4 space-y-3 ${isCollapsed ? 'px-2' : ''}`}>
          {/* User Profile Card */}
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 ${isCollapsed ? 'justify-center p-2' : ''}`}>
            <div className="relative flex-shrink-0">
              <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-2 ring-offset-slate-900">
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                  {getUserInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden flex-1">
                <span className="text-sm font-medium text-white truncate">{userEmail.split('@')[0]}</span>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-400" />
                  <TranslatedText as="span" className="text-[11px] text-amber-400 font-medium">Pro Advisor</TranslatedText>
                </div>
              </div>
            )}
          </div>
          
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
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
