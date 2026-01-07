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
  ClipboardList
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
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface InvestorSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

const investorItems = [
  { 
    title: "Dashboard", 
    url: "/investor/dashboard", 
    icon: BarChart3,
  },
  { 
    title: "Research Reports",
    url: "/investor/research", 
    icon: FileText,
  },
  { 
    title: "Analysis Reports", 
    url: "/investor/analysis", 
    icon: BarChart3,
  },
  { 
    title: "Market Commentary", 
    url: "/investor/commentary", 
    icon: TrendingUp,
  },
  { 
    title: "Model Portfolios", 
    url: "/investor/portfolios", 
    icon: Briefcase,
  },
  { 
    title: "Signals & Alerts", 
    url: "/investor/alerts", 
    icon: Bell,
  },
  { 
    title: "Newsletters", 
    url: "/investor/newsletters", 
    icon: Mail,
  },
  { 
    title: "Benchmarking & Trends", 
    url: "/investor/trends", 
    icon: LineChart,
  },
  { 
    title: "Screeners & Discovery", 
    url: "/investor/screeners", 
    icon: Search,
  },
  { 
    title: "Fund & ETF Database", 
    url: "/investor/fund-database", 
    icon: Database,
  },
  { 
    title: "AI Analyst", 
    url: "/investor/ai-analyst", 
    icon: Brain,
  },
  { 
    title: "Learning Hub", 
    url: "/investor/learning", 
    icon: GraduationCap,
  },
  { 
    title: "Market Data Hub", 
    url: "/investor/market-data", 
    icon: Database,
  },
  { 
    title: "Tools & Calculators", 
    url: "/investor/tools", 
    icon: Calculator,
  },
  { 
    title: "Risk & Compliance", 
    url: "/investor/risk-compliance", 
    icon: Shield,
  },
  { 
    title: "Watchlists", 
    url: "/investor/watchlists", 
    icon: Eye,
  },
  { 
    title: "Tasks", 
    url: "/investor/tasks", 
    icon: ClipboardList,
  },
  { 
    title: "Languages", 
    url: "/investor/languages", 
    icon: Languages,
  },
];

export function InvestorSidebar({ userEmail, onLogout }: InvestorSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "hover:bg-sidebar-accent/50";
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border relative overflow-hidden">
      {/* Enterprise gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(265_45%_18%)] via-[hsl(270_55%_20%)] to-[hsl(280_50%_12%)] pointer-events-none" />
      
      {/* Subtle animated glow effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[hsl(265_85%_65%/0.15)] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(280_50%_10%/0.8)] to-transparent pointer-events-none" />
      
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[hsl(265_85%_65%)] via-[hsl(280_75%_60%)] to-[hsl(265_85%_65%/0.2)] pointer-events-none" />

      <SidebarHeader className="border-b border-[hsl(265_40%_28%/0.5)] relative z-10 bg-[hsl(265_45%_15%/0.3)] backdrop-blur-sm">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[hsl(265_85%_65%/0.3)] rounded-lg blur-md" />
            <img src={flowpulseLogo} alt="FlowPulse Logo" className="h-9 w-9 relative rounded-lg shadow-lg" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight text-base">FlowPulse</span>
              <span className="text-[11px] text-[hsl(270_50%_80%)] font-medium tracking-wider uppercase">Investor Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[hsl(270_40%_70%)] uppercase text-[10px] font-semibold tracking-widest px-4 py-3">
            {!collapsed && <TranslatedText>Investment Portal</TranslatedText>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {investorItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                const navItem = (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`
                          relative group flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-all duration-200 ease-out
                          ${active 
                            ? 'bg-[hsl(265_85%_65%/0.2)] text-white shadow-[inset_0_0_20px_hsl(265_85%_65%/0.1)]' 
                            : 'text-[hsl(270_30%_80%)] hover:text-white hover:bg-[hsl(265_50%_30%/0.4)]'
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[hsl(265_85%_70%)] to-[hsl(280_75%_60%)] rounded-full shadow-[0_0_8px_hsl(265_85%_65%/0.5)]" />
                        )}
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-md
                          transition-all duration-200
                          ${active 
                            ? 'bg-[hsl(265_85%_65%/0.25)] shadow-[0_0_12px_hsl(265_85%_65%/0.3)]' 
                            : 'bg-[hsl(265_40%_25%/0.5)] group-hover:bg-[hsl(265_50%_30%/0.6)]'
                          }
                        `}>
                          <Icon className={`h-4 w-4 ${active ? 'text-[hsl(270_85%_80%)]' : ''}`} />
                        </div>
                        {!collapsed && (
                          <span className={`text-sm font-medium ${active ? 'text-white' : ''}`}>
                            <TranslatedText>{item.title}</TranslatedText>
                          </span>
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
                          {navItem}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[hsl(265_45%_20%)] border-[hsl(265_40%_30%)] text-white">
                          <TranslatedText as="p">{item.title}</TranslatedText>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return navItem;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[hsl(265_40%_28%/0.5)] p-4 relative z-10 bg-[hsl(265_45%_12%/0.5)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[hsl(265_85%_65%/0.3)] rounded-full blur-sm" />
            <Avatar className="h-9 w-9 relative ring-2 ring-[hsl(265_85%_65%/0.3)]">
              <AvatarFallback className="bg-gradient-to-br from-[hsl(265_85%_55%)] to-[hsl(280_75%_50%)] text-white font-semibold text-sm">
                {getUserInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userEmail}</p>
              <p className="text-[11px] text-[hsl(270_40%_65%)]">Investor Account</p>
            </div>
          )}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 text-[hsl(270_40%_70%)] hover:text-white hover:bg-[hsl(265_50%_30%/0.5)] transition-colors"
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
                    className="h-8 w-8 text-[hsl(270_40%_70%)] hover:text-white hover:bg-[hsl(265_50%_30%/0.5)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[hsl(265_45%_20%)] border-[hsl(265_40%_30%)] text-white">
                  <TranslatedText as="p">Logout</TranslatedText>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
