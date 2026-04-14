import { memo, useState, useCallback, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { PlatformSearch, buildSearchableRoutes } from "./PlatformSearch";
import { TranslatedText } from "./TranslatedText";
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
  ChevronDown,
  Moon,
  FolderKanban,
  Zap,
  Globe,
  Lightbulb,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

import { cn } from "@/lib/utils";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { SidebarTabFilter } from "./SidebarTabFilter";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AppSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  gradient: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-blue-600" },
      { title: "AI Chatbot", url: "/theodore", icon: MessageSquare, gradient: "from-violet-500 to-purple-600" },
      { title: "Calendar", url: "/calendar", icon: Calendar, gradient: "from-emerald-500 to-emerald-600" },
      { title: "CRM", url: "/finance-crm", icon: Users, gradient: "from-cyan-500 to-cyan-600" },
      { title: "Market Data", url: "/market", icon: TrendingUp, gradient: "from-green-500 to-emerald-600" },
      { title: "Languages", url: "/finance/languages", icon: Globe, gradient: "from-sky-500 to-sky-600" },
    ],
  },
  {
    label: "Adviser Tools",
    items: [
      { title: "Client Management", url: "/clients", icon: Users, gradient: "from-indigo-500 to-indigo-600" },
      { title: "Client Onboarding", url: "/onboarding", icon: UserPlus, gradient: "from-teal-500 to-teal-600" },
      { title: "Financial Planning", url: "/financial-planning", icon: Calculator, gradient: "from-amber-500 to-yellow-600" },
      { title: "Portfolio Management", url: "/portfolio", icon: PieChart, gradient: "from-pink-500 to-rose-600" },
      { title: "Goal Planning", url: "/goals", icon: Target, gradient: "from-orange-500 to-orange-600" },
      { title: "Investment Analysis", url: "/investments", icon: BarChart3, gradient: "from-purple-500 to-purple-600" },
      { title: "Risk Assessment", url: "/risk", icon: AlertTriangle, gradient: "from-red-500 to-red-600" },
      { title: "Scenario Analysis", url: "/scenario", icon: Activity, gradient: "from-fuchsia-500 to-fuchsia-600" },
      { title: "Fund & ETF Database", url: "/finance/fund-database", icon: BarChart3, gradient: "from-slate-500 to-slate-600" },
      { title: "Practice Management", url: "/practice", icon: Briefcase, gradient: "from-stone-500 to-stone-600" },
      { title: "Compliance", url: "/compliance", icon: Shield, gradient: "from-rose-500 to-rose-600" },
    ],
  },
  {
    label: "Research & Analysis",
    items: [
      { title: "Featured Picks", url: "/finance/featured-picks", icon: Sparkles, gradient: "from-amber-500 to-yellow-600" },
      { title: "Market Commentary", url: "/finance/commentary", icon: TrendingUp, gradient: "from-emerald-500 to-emerald-600" },
      { title: "Model Portfolios", url: "/finance/portfolios", icon: Briefcase, gradient: "from-teal-500 to-teal-600" },
      { title: "Benchmarking & Trends", url: "/finance/trends", icon: Activity, gradient: "from-cyan-500 to-cyan-600" },
      { title: "AI Analyst", url: "/finance/ai-analyst", icon: Bot, gradient: "from-pink-500 to-rose-600" },
      { title: "Watchlists", url: "/finance/watchlists", icon: FolderKanban, gradient: "from-blue-500 to-indigo-600" },
      { title: "Screeners & Discovery", url: "/finance/screeners", icon: Zap, gradient: "from-orange-500 to-orange-600" },
      { title: "Stocks & Crypto", url: "/finance/stocks-crypto", icon: TrendingUp, gradient: "from-green-500 to-emerald-600" },
      { title: "Analyst Reports", url: "/finance/reports", icon: FileText, gradient: "from-indigo-500 to-indigo-600" },
      { title: "Opportunity Intelligence", url: "/finance/opportunities", icon: Lightbulb, gradient: "from-yellow-500 to-amber-600" },
    ],
  },
];

export const AppSidebar = memo(function AppSidebar({ userEmail, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile } = useUserProfile();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRoutes = useMemo(() => buildSearchableRoutes(navGroups), []);

  const [hiddenUrls, setHiddenUrls] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sidebar_hidden_tabs_finance") || "[]"); } catch { return []; }
  });
  const handleFilterChange = useCallback((urls: string[]) => setHiddenUrls(urls), []);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("sidebar_collapsed_groups_finance") || "{}"); } catch { return {}; }
  });

  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem("sidebar_collapsed_groups_finance", JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredNavGroups = useMemo(() => navGroups.map(g => ({
    ...g,
    items: g.items.filter(item => !hiddenUrls.includes(item.url))
  })).filter(g => g.items.length > 0), [hiddenUrls]);

  const visibleNavGroups = filteredNavGroups.length > 0 ? filteredNavGroups : navGroups;

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [pathname, query] = path.split("?");
      return location.pathname === pathname && location.search.includes(query);
    }
    return location.pathname === path;
  };

  const activeGroupLabel = useMemo(
    () => visibleNavGroups.find((group) => group.items.some((item) => isActive(item.url)))?.label,
    [visibleNavGroups, location.pathname, location.search]
  );

  const allGroupsCollapsed = !collapsed && visibleNavGroups.length > 0 && visibleNavGroups.every((group) => collapsedGroups[group.label]);

  const isGroupExpanded = useCallback(
    (label: string) => {
      if (collapsed) return true;
      if (label === activeGroupLabel) return true;
      if (allGroupsCollapsed) return label === visibleNavGroups[0]?.label;
      return !collapsedGroups[label];
    },
    [activeGroupLabel, allGroupsCollapsed, collapsed, collapsedGroups, visibleNavGroups]
  );

  const getUserInitials = (value: string) =>
    value.split("@")[0].split(/[.\s_-]+/).filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const displayName = profile.full_name || profile.first_name || userEmail;

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "relative flex h-screen min-h-screen flex-col overflow-hidden border-r transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-[hsl(221,83%,42%)] via-[hsl(221,83%,32%)] to-[hsl(221,83%,22%)]",
        "backdrop-blur-xl",
        "border-white/10",
        "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Ambient glow overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Header */}
      <SidebarHeader className="relative border-b border-white/10 p-4 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />
        <div className="relative flex items-center justify-center gap-3">
          <div className={cn(
            "shrink-0 p-2 rounded-xl bg-gradient-to-br from-white/25 to-white/10 shadow-lg shadow-black/20",
            "ring-2 ring-white/20"
          )}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent truncate">
                FlowPulse
              </h2>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-blue-300" />
                <p className="text-xs text-white/50 truncate">Finance Platform</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <PlatformSearch routes={searchRoutes} open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Navigation */}
      <SidebarContent className="flex-1 relative z-10 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin scrollbar-track-transparent">
          {!collapsed && (
            <div className="flex items-center justify-between mb-1 px-1 gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white/90 text-xs transition-all"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search...</span>
                <kbd className="ml-auto hidden sm:inline-flex rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-[9px]">⌘K</kbd>
              </button>
              <SidebarTabFilter platform="finance" navGroups={navGroups} onFilterChange={handleFilterChange} />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-1">
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white/90 transition-all">
                <Search className="h-4 w-4" />
              </button>
            </div>
          )}
          {visibleNavGroups.map((group) => (
            <SidebarGroup key={group.label} className={cn("mb-1 p-0.5", collapsed && "px-0")}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 mb-1 group/label hover:bg-white/[0.04] rounded-md transition-colors"
                >
                  <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/70 p-0 m-0">
                    <TranslatedText>{group.label}</TranslatedText>
                  </SidebarGroupLabel>
                  <ChevronDown className={cn(
                    "h-3 w-3 text-white/40 transition-transform duration-200 group-hover/label:text-white/60",
                    collapsedGroups[group.label] && "-rotate-90"
                  )} />
                </button>
              )}
              {isGroupExpanded(group.label) && (
              <SidebarGroupContent>
                <SidebarMenu className="space-y-px">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title} size="default">
                          <NavLink
                            to={item.url}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                              "group/nav relative overflow-hidden",
                              collapsed ? "justify-center p-0" : "px-3 py-2",
                              active
                                ? cn(
                                    "bg-gradient-to-r text-white shadow-lg",
                                    item.gradient,
                                    "shadow-blue-500/20",
                                    "ring-1 ring-white/25"
                                  )
                                : cn(
                                    "text-white/85 hover:text-white",
                                    "hover:bg-white/[0.08]",
                                    "hover:shadow-sm hover:ring-1 hover:ring-white/10"
                                  )
                            )}
                          >
                            {active && (
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                            )}
                            <Icon className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-white" : "text-white/75 group-hover/nav:text-white"
                            )} />
                            {!collapsed && (
                              <span className="relative truncate">
                                <TranslatedText>{item.title}</TranslatedText>
                              </span>
                            )}
                            {active && !collapsed && (
                              <div className="absolute right-2 w-2 h-2 rounded-full bg-white/60 shadow-inner" />
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              )}
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="relative border-t border-white/10 p-3 shrink-0 mt-auto">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <Avatar className={cn(
            "h-9 w-9 shrink-0 ring-2 ring-white/20 shadow-lg",
            "bg-gradient-to-br from-blue-400 to-blue-600"
          )}>
            <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
              {getUserInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-white/40 truncate">{userEmail}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button asChild variant="ghost" size="icon"
                  className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
                  title="Settings"
                >
                  <NavLink to="/settings"><Settings className="h-4 w-4" /></NavLink>
                </Button>
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/15 text-amber-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all duration-200"
                  onClick={() => {
                    const html = document.documentElement;
                    const isDark = html.classList.contains("dark");
                    if (isDark) { html.classList.remove("dark", "gold-theme"); }
                    else { html.classList.add("dark", "gold-theme"); }
                    window.dispatchEvent(new Event("darkmode-toggle"));
                  }}
                  title="Toggle theme"
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all duration-200"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        {collapsed && (
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all duration-200" title="Settings">
              <NavLink to="/settings"><Settings className="h-4 w-4" /></NavLink>
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/15 text-amber-400 hover:text-amber-300 transition-all duration-200"
              onClick={() => {
                const html = document.documentElement;
                const isDark = html.classList.contains("dark");
                if (isDark) { html.classList.remove("dark", "gold-theme"); }
                else { html.classList.add("dark", "gold-theme"); }
                window.dispatchEvent(new Event("darkmode-toggle"));
              }}
              title="Toggle theme"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all duration-200"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>

      {/* Collapse toggle — floating pill */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 z-10",
          "w-6 h-6 rounded-full",
          "bg-[hsl(221,83%,35%)] border border-white/20 shadow-lg",
          "flex items-center justify-center",
          "hover:bg-[hsl(221,83%,45%)] hover:border-white/30",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-white/80" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-white/80" />
        )}
      </button>
    </Sidebar>
  );
});
