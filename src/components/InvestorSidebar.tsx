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
  Languages
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
    title: "Opportunities", 
    url: "/opportunities", 
    icon: Briefcase,
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={flowpulseLogo} alt="FlowPulse Logo" className="h-8 w-8" />
          {!collapsed && (
            <TranslatedText as="span" className="font-semibold text-sidebar-foreground">FlowPulse Investor</TranslatedText>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && <TranslatedText>Investment Portal</TranslatedText>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {investorItems.map((item) => {
                const Icon = item.icon;
                const navItem = (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavClassName(item.url)}
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <TranslatedText as="span">{item.title}</TranslatedText>}
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
                        <TooltipContent side="right">
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {getUserInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userEmail}</p>
            </div>
          )}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
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
                    className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
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
