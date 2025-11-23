import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Home, Briefcase, TrendingUp, Users, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface MobileMenuProps {
  platform?: "business" | "finance" | "investor";
}

export function MobileMenu({ platform = "business" }: MobileMenuProps) {
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

  const businessLinks = [
    { title: "Dashboard", url: "/business/dashboard", icon: Home },
    { title: "CRM", url: "/business/crm", icon: Users },
    { title: "Projects", url: "/business/projects", icon: Briefcase },
    { title: "AI Generator", url: "/business-ai-generator", icon: FileText },
    { title: "Automation", url: "/business/automation", icon: Settings },
  ];

  const financeLinks = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Clients", url: "/clients", icon: Users },
    { title: "Financial Planning", url: "/financial-planning", icon: TrendingUp },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Payroll", url: "/payroll", icon: Briefcase },
  ];

  const investorLinks = [
    { title: "Dashboard", url: "/investor/dashboard", icon: Home },
    { title: "Features", url: "/investor-features", icon: TrendingUp },
    { title: "Research Reports", url: "/investor/research", icon: FileText },
    { title: "Market Commentary", url: "/investor/commentary", icon: TrendingUp },
    { title: "AI Analyst", url: "/investor/ai-analyst", icon: Settings },
    { title: "Watchlists", url: "/investor/watchlists", icon: Briefcase },
    { title: "Pricing", url: "/pricing", icon: Briefcase },
  ];

  const links = platform === "business" ? businessLinks 
    : platform === "finance" ? financeLinks 
    : investorLinks;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8 w-8" />
            FlowPulse {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.url}
                  to={link.url}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.title}</span>
                </NavLink>
              );
            })}
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
