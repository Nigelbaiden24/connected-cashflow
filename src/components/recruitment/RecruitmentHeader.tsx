import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Code, 
  TrendingUp, 
  Building2,
  User,
  Phone,
  Settings,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface RecruitmentHeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function RecruitmentHeader({ onNavigate, currentSection }: RecruitmentHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setIsAdmin(roleData?.role === "admin");
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const saasItems = [
    { id: "login", label: "Flowpulse Finance", icon: TrendingUp },
    { id: "business-dashboard", label: "Flowpulse Business", icon: Building2 },
  ];

  const recruitmentItems = [
    { id: "tech", label: "Technology", icon: Code },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "general", label: "All Sectors", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">FlowPulse</span>
              <span className="text-xs text-muted-foreground">Recruitment</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate("home")}
              className={`flex items-center gap-2 text-base font-bold transition-colors hover:text-primary ${
                currentSection === "home" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </button>

            {/* Saas Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-primary">
                Saas
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border z-50">
                {saasItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Recruitment Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-primary">
                Recruitment
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border z-50">
                {recruitmentItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => onNavigate("admin-jobs")}>
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button size="sm" onClick={() => onNavigate("candidate-register")}>
              <User className="h-4 w-4 mr-2" />
              For Candidates
            </Button>
            <Button size="sm" onClick={() => onNavigate("employer-register")}>
              <Building2 className="h-4 w-4 mr-2" />
              For Employers
            </Button>
            <Button size="sm" onClick={() => onNavigate("about")}>
              <User className="h-4 w-4 mr-2" />
              About Us
            </Button>
            <Button size="sm" onClick={() => onNavigate("contact")}>
              <Phone className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => {
                  onNavigate("home");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Home
              </button>

              {/* Saas Section */}
              <div className="pl-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Saas</p>
                {saasItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground mb-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Recruitment Section */}
              <div className="pl-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Recruitment</p>
                {recruitmentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground mb-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button size="sm" className="justify-start" onClick={() => {
                  onNavigate("candidate-register");
                  setMobileMenuOpen(false);
                }}>
                  <User className="h-4 w-4 mr-2" />
                  For Candidates
                </Button>
                <Button size="sm" className="justify-start" onClick={() => {
                  onNavigate("employer-register");
                  setMobileMenuOpen(false);
                }}>
                  <Building2 className="h-4 w-4 mr-2" />
                  For Employers
                </Button>
                <Button size="sm" className="justify-start" onClick={() => {
                  onNavigate("about");
                  setMobileMenuOpen(false);
                }}>
                  <User className="h-4 w-4 mr-2" />
                  About Us
                </Button>
                <Button size="sm" className="justify-start" onClick={() => {
                  onNavigate("contact");
                  setMobileMenuOpen(false);
                }}>
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
