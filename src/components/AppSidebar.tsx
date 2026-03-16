import { NavLink, useLocation } from "react-router-dom";
import { memo, useState, useCallback } from "react";
import { SidebarTabFilter } from "./SidebarTabFilter";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  User,
  Bell,
  Moon,
  UserCog,
  History,
  FolderKanban,
  Zap,
  Globe,
  Lightbulb,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AppSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

const generalItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Chatbot", url: "/theodore", icon: MessageSquare },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "CRM", url: "/finance-crm", icon: Users },
  { title: "Market Data", url: "/market", icon: TrendingUp },
  { title: "Languages", url: "/finance/languages", icon: Globe },
];

const adviserToolsItems = [
  { title: "Client Management", url: "/clients", icon: Users },
  { title: "Client Onboarding", url: "/onboarding", icon: UserPlus },
  { title: "Financial Planning", url: "/financial-planning", icon: Calculator },
  { title: "Portfolio Management", url: "/portfolio", icon: PieChart },
  { title: "Goal Planning", url: "/goals", icon: Target },
  { title: "Investment Analysis", url: "/investments", icon: BarChart3 },
  { title: "Risk Assessment", url: "/risk", icon: AlertTriangle },
  { title: "Scenario Analysis", url: "/scenario", icon: Activity },
  { title: "Fund & ETF Database", url: "/finance/fund-database", icon: BarChart3 },
  { title: "Practice Management", url: "/practice", icon: Briefcase },
  { title: "Compliance", url: "/compliance", icon: Shield },
];

const researchAnalysisItems = [
  { title: "Featured Picks", url: "/finance/featured-picks", icon: Sparkles },
  { title: "Market Commentary", url: "/finance/commentary", icon: TrendingUp },
  { title: "Model Portfolios", url: "/finance/portfolios", icon: Briefcase },
  { title: "Benchmarking & Trends", url: "/finance/trends", icon: Activity },
  { title: "AI Analyst", url: "/finance/ai-analyst", icon: Bot },
  { title: "Watchlists", url: "/finance/watchlists", icon: FolderKanban },
  { title: "Screeners & Discovery", url: "/finance/screeners", icon: Zap },
  { title: "Stocks & Crypto", url: "/finance/stocks-crypto", icon: TrendingUp },
  { title: "Analyst Reports", url: "/finance/reports", icon: FileText },
  { title: "Opportunity Intelligence", url: "/finance/opportunities", icon: Lightbulb },
];


const financeNavGroups = [
  { label: "General", items: generalItems },
  { label: "Adviser Tools", items: adviserToolsItems },
  { label: "Research & Analysis", items: researchAnalysisItems },
];

export const AppSidebar = memo(function AppSidebar({ userEmail, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const [hiddenUrls, setHiddenUrls] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sidebar_hidden_tabs_finance") || "[]"); } catch { return []; }
  });
  const handleFilterChange = useCallback((urls: string[]) => setHiddenUrls(urls), []);

  const filteredGeneralItems = generalItems.filter(i => !hiddenUrls.includes(i.url));
  const filteredAdviserItems = adviserToolsItems.filter(i => !hiddenUrls.includes(i.url));
  const filteredResearchItems = researchAnalysisItems.filter(i => !hiddenUrls.includes(i.url));

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
      : "text-white/80 hover:bg-white/10 hover:text-white";
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

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar 
      className="border-r-0"
      collapsible="icon"
      style={{
        background: "linear-gradient(180deg, hsl(221 83% 45%) 0%, hsl(221 83% 35%) 50%, hsl(221 83% 25%) 100%)",
      }}
    >
      {/* Static background overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      </div>

      <SidebarHeader className="border-b border-white/10 relative z-10 shrink-0">
        <div className={`flex items-center gap-3 px-4 py-5 ${isCollapsed ? 'flex-col justify-center px-2 gap-2' : ''}`}>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <TranslatedText as="span" className="text-base font-bold text-white tracking-tight truncate">FlowPulse.io</TranslatedText>
              <TranslatedText as="span" className="text-xs text-white/60 font-medium truncate">Wealth Platform</TranslatedText>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex-shrink-0 transition-all duration-200"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 px-2 overflow-y-auto">
        <TooltipProvider>
          {!isCollapsed && (
            <div className="flex justify-end mt-2 mb-1 px-2">
              <SidebarTabFilter platform="finance" navGroups={financeNavGroups} onFilterChange={handleFilterChange} />
            </div>
          )}
          {filteredGeneralItems.length > 0 && (
          <SidebarGroup className="mt-1">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>General</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredGeneralItems.map((item) => (
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
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}>
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
          )}

          {filteredAdviserItems.length > 0 && (
          <SidebarGroup className="mt-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>Adviser Tools</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredAdviserItems.map((item) => (
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
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}>
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
          )}

          {filteredResearchItems.length > 0 && (
          <SidebarGroup className="mt-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                <TranslatedText>Research & Analysis</TranslatedText>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredResearchItems.map((item) => (
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
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} flex items-center gap-3 px-3 py-2 rounded-xl`}>
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
          )}
        </TooltipProvider>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 relative z-10 shrink-0 mt-auto">
        <div className={`p-3 space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
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
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 overflow-visible shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 text-amber-400 hover:text-amber-300 transition-all duration-200"
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains("dark");
                  if (isDark) { html.classList.remove("dark", "gold-theme"); }
                  else { html.classList.add("dark", "gold-theme"); }
                  window.dispatchEvent(new Event("darkmode-toggle"));
                }}
                title="Toggle Black & Gold mode"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 justify-start"
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains("dark");
                  if (isDark) { html.classList.remove("dark", "gold-theme"); }
                  else { html.classList.add("dark", "gold-theme"); }
                  window.dispatchEvent(new Event("darkmode-toggle"));
                }}
                title="Toggle Black & Gold mode"
              >
                <Moon className="h-4 w-4 flex-shrink-0 text-amber-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 justify-start"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <TranslatedText as="span" className="ml-2">Sign Out</TranslatedText>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});