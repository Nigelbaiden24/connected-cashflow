import { NavLink, useLocation } from "react-router-dom";
import { TranslatedText } from "./TranslatedText";
import { 
  FileText,
  BarChart3,
  TrendingUp,
  Briefcase,
  Bell,
  Mail,
  LineChart,
  LogOut,
  Search,
  Brain,
  GraduationCap,
  Database,
  Calculator,
  Shield,
  Eye,
  Languages,
  ClipboardList,
  Lightbulb,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
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
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface InvestorSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  gradient: string;
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/investor/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-blue-600" },
    ]
  },
  {
    label: "Research & Analysis",
    items: [
      { title: "Research Reports", url: "/investor/research", icon: FileText, gradient: "from-indigo-500 to-indigo-600" },
      { title: "Analysis Reports", url: "/investor/analysis", icon: BarChart3, gradient: "from-violet-500 to-violet-600" },
      { title: "Market Commentary", url: "/investor/commentary", icon: TrendingUp, gradient: "from-purple-500 to-purple-600" },
      { title: "AI Analyst", url: "/investor/ai-analyst", icon: Brain, gradient: "from-pink-500 to-rose-600" },
    ]
  },
  {
    label: "Market Intelligence",
    items: [
      { title: "News", url: "/investor/news", icon: Newspaper, gradient: "from-emerald-500 to-emerald-600" },
      { title: "Signals & Alerts", url: "/investor/alerts", icon: Bell, gradient: "from-amber-500 to-orange-600" },
      { title: "Benchmarking & Trends", url: "/investor/trends", icon: LineChart, gradient: "from-cyan-500 to-cyan-600" },
      { title: "Opportunity Intelligence", url: "/investor/opportunities", icon: Lightbulb, gradient: "from-yellow-500 to-amber-600" },
    ]
  },
  {
    label: "Investments",
    items: [
      { title: "Model Portfolios", url: "/investor/portfolios", icon: Briefcase, gradient: "from-teal-500 to-teal-600" },
      { title: "Fund & ETF Database", url: "/investor/fund-database", icon: Database, gradient: "from-sky-500 to-sky-600" },
      { title: "Stocks & Crypto", url: "/investor/stocks-crypto", icon: TrendingUp, gradient: "from-green-500 to-emerald-600" },
      { title: "Watchlists", url: "/investor/watchlists", icon: Eye, gradient: "from-slate-500 to-slate-600" },
    ]
  },
  {
    label: "Discovery & Tools",
    items: [
      { title: "Screeners & Discovery", url: "/investor/screeners", icon: Search, gradient: "from-orange-500 to-orange-600" },
      { title: "Market Data Hub", url: "/investor/market-data", icon: Database, gradient: "from-blue-500 to-indigo-600" },
      { title: "Tools & Calculators", url: "/investor/tools", icon: Calculator, gradient: "from-rose-500 to-rose-600" },
    ]
  },
  {
    label: "Resources",
    items: [
      { title: "Learning Hub", url: "/investor/learning", icon: GraduationCap, gradient: "from-fuchsia-500 to-fuchsia-600" },
      { title: "Newsletters", url: "/investor/newsletters", icon: Mail, gradient: "from-lime-500 to-green-600" },
      { title: "Risk & Compliance", url: "/investor/risk-compliance", icon: Shield, gradient: "from-red-500 to-red-600" },
    ]
  },
  {
    label: "Workspace",
    items: [
      { title: "Tasks", url: "/investor/tasks", icon: ClipboardList, gradient: "from-stone-500 to-stone-600" },
      { title: "Languages", url: "/investor/languages", icon: Languages, gradient: "from-zinc-500 to-zinc-600" },
    ]
  },
];

export function InvestorSidebar({ userEmail, onLogout }: InvestorSidebarProps) {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "relative flex flex-col h-screen border-r transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950",
        "backdrop-blur-xl",
        "border-slate-700/50",
        "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Header with premium branding */}
      <SidebarHeader className="relative border-b border-slate-700/50 p-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        <div className="relative flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30",
            "ring-2 ring-white/10"
          )}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
                FlowPulse
              </h2>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <p className="text-xs text-slate-400 truncate">Investor Portal</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation with grouped sections */}
      <SidebarContent className="flex-1">
        <ScrollArea className="h-full px-3 py-4">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="mb-4">
              {!collapsed && (
                <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  <TranslatedText>{group.label}</TranslatedText>
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);

                    const menuItem = (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                              "group relative overflow-hidden",
                              active
                                ? cn(
                                    "bg-gradient-to-r text-white shadow-lg",
                                    item.gradient,
                                    "shadow-primary/20",
                                    "ring-1 ring-white/20"
                                  )
                                : cn(
                                    "text-slate-400 hover:text-white",
                                    "hover:bg-slate-800/60",
                                    "hover:shadow-sm hover:ring-1 hover:ring-slate-700/50"
                                  )
                            )}
                          >
                            {/* Glossy overlay for active state */}
                            {active && (
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                            )}
                            
                            <div className={cn(
                              "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                              active 
                                ? "bg-white/20 shadow-inner" 
                                : "bg-slate-800/60 group-hover:bg-slate-700/60"
                            )}>
                              <Icon className={cn(
                                "h-4 w-4",
                                active ? "text-white" : "text-slate-400 group-hover:text-white"
                              )} />
                            </div>
                            
                            {!collapsed && (
                              <span className="relative truncate">
                                <TranslatedText>{item.title}</TranslatedText>
                              </span>
                            )}

                            {/* Active indicator dot */}
                            {active && !collapsed && (
                              <div className="absolute right-2 w-2 h-2 rounded-full bg-white/60 shadow-inner" />
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );

                    if (collapsed) {
                      return (
                        <TooltipProvider key={item.title}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {menuItem}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                              <TranslatedText as="p">{item.title}</TranslatedText>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return menuItem;
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      {/* Premium footer with user info */}
      <SidebarFooter className="relative border-t border-slate-700/50 p-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-9 w-9 ring-2 ring-slate-700 shadow-lg",
            "bg-gradient-to-br from-primary to-primary/80"
          )}>
            <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
              {getUserInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userEmail}</p>
              <p className="text-xs text-slate-500">Investor Account</p>
            </div>
          )}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className={cn(
                "h-9 w-9 rounded-lg",
                "bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400",
                "border border-slate-700/50 hover:border-red-500/30",
                "transition-all duration-200"
              )}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className={cn(
                      "h-9 w-9 rounded-lg",
                      "bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400",
                      "border border-slate-700/50 hover:border-red-500/30",
                      "transition-all duration-200"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                  <TranslatedText as="p">Logout</TranslatedText>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </SidebarFooter>

      {/* Collapse toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 z-10",
          "w-6 h-6 rounded-full",
          "bg-slate-800 border border-slate-600 shadow-lg",
          "flex items-center justify-center",
          "hover:bg-slate-700 hover:border-slate-500",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-slate-300" />
        )}
      </button>
    </Sidebar>
  );
}
