import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  Briefcase, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  Shield,
  Calculator,
  Globe,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslatedText } from "./TranslatedText";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  platform?: "business" | "finance" | "investor";
  userEmail?: string;
}

interface NavGroup {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
}

const businessNavGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/business/dashboard", icon: Home },
      { title: "Projects", url: "/business/projects", icon: Briefcase },
      { title: "Tasks", url: "/business/tasks", icon: FileText },
      { title: "AI Chat", url: "/business/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "CRM", url: "/business/crm", icon: Users },
      { title: "Analytics", url: "/business/analytics", icon: BarChart3 },
      { title: "Revenue", url: "/business/revenue", icon: TrendingUp },
      { title: "Team", url: "/business/team", icon: Users },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "HR & Payroll", url: "/business/payroll", icon: Calculator },
      { title: "Security", url: "/business/security", icon: Shield },
      { title: "Languages", url: "/business/languages", icon: Globe },
    ],
  },
];

const financeNavGroups: NavGroup[] = [
  {
    label: "AI Tools",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "AI Chatbot", url: "/theodore", icon: MessageSquare },
      { title: "Market Data", url: "/market", icon: TrendingUp },
    ],
  },
  {
    label: "Financial Planning",
    items: [
      { title: "Financial Planning", url: "/financial-planning", icon: Calculator },
      { title: "Portfolio", url: "/portfolio", icon: Briefcase },
      { title: "Risk Assessment", url: "/risk", icon: Shield },
    ],
  },
  {
    label: "Practice",
    items: [
      { title: "Clients", url: "/clients", icon: Users },
      { title: "Compliance", url: "/compliance", icon: Shield },
      { title: "Reports", url: "/finance/reports", icon: FileText },
      { title: "Languages", url: "/finance/languages", icon: Globe },
    ],
  },
];

const investorNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/investor/dashboard", icon: Home },
    ],
  },
  {
    label: "Research",
    items: [
      { title: "Research Reports", url: "/investor/research", icon: FileText },
      { title: "Market Commentary", url: "/investor/commentary", icon: TrendingUp },
      { title: "AI Analyst", url: "/investor/ai-analyst", icon: MessageSquare },
    ],
  },
  {
    label: "Investments",
    items: [
      { title: "Watchlists", url: "/investor/watchlists", icon: Briefcase },
      { title: "Fund Database", url: "/investor/fund-database", icon: BarChart3 },
      { title: "Languages", url: "/investor/languages", icon: Globe },
    ],
  },
];

export function MobileMenu({ platform = "business", userEmail = "" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const getNavGroups = () => {
    switch (platform) {
      case "business":
        return businessNavGroups;
      case "finance":
        return financeNavGroups;
      case "investor":
        return investorNavGroups;
      default:
        return businessNavGroups;
    }
  };

  const getVariantStyles = () => {
    switch (platform) {
      case "business":
        return {
          gradient: "from-[hsl(142_76%_36%)] to-[hsl(142_70%_45%)]",
          accent: "hsl(142 76% 36%)",
        };
      case "finance":
        return {
          gradient: "from-[hsl(221_83%_53%)] to-[hsl(217_91%_60%)]",
          accent: "hsl(221 83% 53%)",
        };
      case "investor":
        return {
          gradient: "from-[hsl(270_75%_45%)] to-[hsl(270_75%_55%)]",
          accent: "hsl(270 75% 55%)",
        };
      default:
        return {
          gradient: "from-primary to-primary",
          accent: "hsl(var(--primary))",
        };
    }
  };

  const getUserInitials = (email: string) => {
    if (!email) return "U";
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navGroups = getNavGroups();
  const styles = getVariantStyles();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 touch-target">
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        {/* Header with gradient */}
        <div className={cn("bg-gradient-to-r p-4", styles.gradient)}>
          <div className="flex items-center gap-3">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 w-10 rounded-lg" />
            <div className="flex flex-col">
              <span className="text-white font-semibold">FlowPulse</span>
              <span className="text-white/80 text-sm capitalize">{platform} Platform</span>
            </div>
          </div>
          
          {/* User info */}
          {userEmail && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-white/10 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-white/20 text-white">
                  {getUserInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{userEmail}</p>
                <p className="text-white/70 text-xs capitalize">{platform} User</p>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  <TranslatedText>{group.label}</TranslatedText>
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all touch-target",
                            "text-sm font-medium",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-accent"
                          )
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <TranslatedText as="span" className="flex-1">{item.title}</TranslatedText>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 touch-target"
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
            >
              <Settings className="h-4 w-4" />
              <TranslatedText>Settings</TranslatedText>
            </Button>
            <Button
              variant="destructive"
              className="gap-2 touch-target"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <TranslatedText>Logout</TranslatedText>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
