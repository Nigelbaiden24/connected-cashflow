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
];

const settingsSubItems = [
  {
    title: "Profile",
    url: "/business/settings?tab=profile",
    icon: User,
  },
  {
    title: "Security",
    url: "/business/settings?tab=security",
    icon: Shield,
  },
  {
    title: "Notifications",
    url: "/business/settings?tab=notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    url: "/business/settings?tab=appearance",
    icon: Palette,
  },
  {
    title: "Account",
    url: "/business/settings?tab=account",
    icon: UserCog,
  },
  {
    title: "Activity",
    url: "/business/settings?tab=activity",
    icon: History,
  },
];

export function BusinessSidebar({ userEmail, onLogout }: BusinessSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [settingsExpanded, setSettingsExpanded] = useState(
    location.pathname === "/business/settings"
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
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Business Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Settings with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className={getNavClassName("/business/settings")}
                >
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && (
                    <>
                      <span>Settings</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${
                          settingsExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </>
                  )}
                </SidebarMenuButton>
                {settingsExpanded && !isCollapsed && (
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
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
