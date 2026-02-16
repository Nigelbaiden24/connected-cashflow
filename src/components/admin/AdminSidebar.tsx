import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Newspaper,
  TrendingUp,
  BookOpen,
  Video,
  List,
  Shield,
  Bell,
  ShoppingBag,
  Star,
  Lightbulb,
  Bitcoin,
  FlaskConical,
  Sparkles,
  Bot,
  Contact,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  ClipboardList,
  Globe,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
}

const navItems: NavItem[] = [
  { id: "planner", label: "Planner", icon: ClipboardList, gradient: "from-indigo-500 to-purple-600" },
  { id: "featured-picks", label: "Featured Picks", icon: Star, gradient: "from-amber-500 to-orange-600" },
  { id: "pdf-generator", label: "PDF Generator", icon: FileText, gradient: "from-rose-500 to-pink-600" },
  { id: "users", label: "Users", icon: Users, gradient: "from-blue-500 to-blue-600" },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare, gradient: "from-orange-500 to-orange-600" },
  { id: "demo-requests", label: "Demo Requests", icon: Calendar, gradient: "from-slate-500 to-slate-600" },
  { id: "calendar", label: "Calendar", icon: Calendar, gradient: "from-blue-500 to-cyan-600" },
  { id: "news", label: "News", icon: Newspaper, gradient: "from-emerald-500 to-emerald-600" },
  { id: "reports", label: "Reports", icon: FileText, gradient: "from-indigo-500 to-indigo-600" },
  { id: "newsletters", label: "Newsletters", icon: Newspaper, gradient: "from-emerald-500 to-emerald-600" },
  { id: "portfolios", label: "Portfolios", icon: TrendingUp, gradient: "from-cyan-500 to-cyan-600" },
  { id: "commentary", label: "Commentary", icon: FileText, gradient: "from-violet-500 to-violet-600" },
  { id: "learning", label: "Learning", icon: BookOpen, gradient: "from-pink-500 to-pink-600" },
  { id: "videos", label: "Videos", icon: Video, gradient: "from-red-500 to-red-600" },
  { id: "watchlists", label: "Watchlists", icon: List, gradient: "from-teal-500 to-teal-600" },
  { id: "risk-compliance", label: "Risk & Compliance", icon: Shield, gradient: "from-amber-500 to-amber-600" },
  { id: "alerts", label: "Signals & Alerts", icon: Bell, gradient: "from-rose-500 to-rose-600" },
  { id: "market-trends", label: "Market Trends", icon: TrendingUp, gradient: "from-lime-500 to-lime-600" },
  { id: "purchasable-reports", label: "Lead Magnet Reports", icon: ShoppingBag, gradient: "from-emerald-500 to-emerald-600" },
  { id: "fund-scoring", label: "Fund Scoring", icon: Star, gradient: "from-amber-500 to-amber-600" },
  { id: "fund-analyst", label: "Fund Analyst", icon: TrendingUp, gradient: "from-teal-500 to-teal-600" },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb, gradient: "from-purple-500 to-purple-600" },
  { id: "stocks-crypto", label: "Stocks & Crypto", icon: Bitcoin, gradient: "from-cyan-500 to-cyan-600" },
  { id: "research-engine", label: "Research Engine", icon: FlaskConical, gradient: "from-indigo-500 to-indigo-600" },
  { id: "document-generator", label: "Document Generator", icon: Sparkles, gradient: "from-violet-500 to-violet-600" },
  { id: "research-ai", label: "Research AI", icon: Bot, gradient: "from-rose-500 to-pink-600" },
  { id: "research-scraper", label: "Research Scraper", icon: Globe, gradient: "from-sky-500 to-blue-600" },
  { id: "crm", label: "CRM", icon: Contact, gradient: "from-blue-500 to-blue-600" },
  { id: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-700" },
];

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen sticky top-0 border-r transition-all duration-300 ease-in-out",
        // Glossy glass effect
        "bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95",
        "backdrop-blur-xl",
        "border-slate-200/60",
        "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.08)]",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header with glossy effect */}
      <div className="relative p-4 border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20",
            "ring-2 ring-white/50"
          )}>
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent truncate">
                Admin Panel
              </h2>
              <p className="text-xs text-slate-500 truncate">FlowPulse Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  "group relative overflow-hidden",
                  isActive
                    ? cn(
                        "bg-gradient-to-r text-white shadow-lg",
                        item.gradient,
                        "shadow-primary/20",
                        "ring-1 ring-white/20"
                      )
                    : cn(
                        "text-slate-600 hover:text-slate-900",
                        "hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80",
                        "hover:shadow-sm hover:ring-1 hover:ring-slate-200/50"
                      )
                )}
              >
                {/* Glossy overlay for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                )}
                
                <div className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-slate-100/60 group-hover:bg-slate-200/60"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                </div>
                
                {!collapsed && (
                  <span className="relative truncate">{item.label}</span>
                )}

                {/* Active indicator dot */}
                {isActive && !collapsed && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white/60 shadow-inner" />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer with logout */}
      <div className="p-3 border-t border-slate-200/50">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
        <Button
          onClick={onLogout}
          variant="outline"
          className={cn(
            "relative w-full justify-start gap-3",
            "bg-white/80 hover:bg-red-50/80 text-red-600 border-red-200/50 hover:border-red-300",
            "shadow-sm hover:shadow-md transition-all duration-200",
            "backdrop-blur-sm",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-10",
          "w-6 h-6 rounded-full",
          "bg-white border border-slate-200 shadow-md",
          "flex items-center justify-center",
          "hover:bg-slate-50 hover:border-slate-300",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
        )}
      </button>
    </div>
  );
}
