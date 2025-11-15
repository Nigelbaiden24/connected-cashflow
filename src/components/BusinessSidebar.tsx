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
  Users,
  Shield,
  FileText,
  Settings,
  LogOut,
  Briefcase,
  Target,
  BarChart3,
  Calendar,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  UserPlus,
  Calculator,
  ChevronRight,
  User,
  Bell,
  Palette,
  UserCog,
  History,
  Activity,
  Globe,
} from "lucide-react";

interface BusinessSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

const businessToolsItems = [
  {
    title: "Dashboard",
    url: "/business/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: "/business/projects",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    url: "/business/tasks",
    icon: ClipboardList,
  },
  {
    title: "AI Chatbot",
    url: "/business/chat",
    icon: MessageSquare,
  },
  {
    title: "Calendar",
    url: "/business/calendar",
    icon: Calendar,
  },
  {
    title: "Document Generator",
    url: "/business/ai-generator",
    icon: Briefcase,
  },
];

const businessManagementItems = [
  {
    title: "Business Planning",
    url: "/business/planning",
    icon: Target,
  },
  {
    title: "Analytics",
    url: "/business/analytics",
    icon: BarChart3,
  },
  {
    title: "Revenue Tracking",
    url: "/business/revenue",
    icon: TrendingUp,
  },
  {
    title: "CRM",
    url: "/business/crm",
    icon: Users,
  },
  {
    title: "Team Management",
    url: "/business/team",
    icon: UserPlus,
  },
  {
    title: "Reports",
    url: "/business/reports",
    icon: FileText,
  },
];

const operationsItems = [
  {
    title: "HR & Payroll",
    url: "/business/payroll",
    icon: Calculator,
  },
  {
    title: "Security",
    url: "/business/security",
    icon: Shield,
  },
  {
    title: "Automation Center",
    url: "/business/automation-center",
    icon: Activity,
  },
];


export function BusinessSidebar({ userEmail, onLogout }: BusinessSidebarProps) {
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
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">FlowPulse</span>
              <span className="text-xs text-sidebar-foreground/70">Business Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <TooltipProvider>
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {businessToolsItems.map((item) => (
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
            {!isCollapsed && <SidebarGroupLabel>Business Management</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {businessManagementItems.map((item) => (
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
            {!isCollapsed && <SidebarGroupLabel>Operations</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {operationsItems.map((item) => (
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
                
                {/* Languages */}
                <SidebarMenuItem>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink to="/business/settings" className={getNavClassName("/business/settings")}>
                            <Globe className="h-4 w-4" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Languages</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to="/business/settings" className={getNavClassName("/business/settings")}>
                        <Globe className="h-4 w-4" />
                        <span>Languages</span>
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
                <span className="text-xs text-sidebar-foreground/70">Business User</span>
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
