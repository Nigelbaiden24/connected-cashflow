import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronDown,
  DollarSign,
  LineChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface RecruitmentHeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function RecruitmentHeader({ onNavigate, currentSection }: RecruitmentHeaderProps) {
  const navigate = useNavigate();
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
    { id: "investor-dashboard", label: "Flowpulse Investor", icon: LineChart },
    { id: "pricing", label: "Pricing", icon: DollarSign },
  ];

  const recruitmentItems = [
    { id: "/technology", label: "Technology", icon: Code },
  ];

  const handleRecruitmentClick = (id: string) => {
    if (id.startsWith("/")) {
      navigate(id);
    } else {
      onNavigate(id);
    }
  };

  const handleCandidatesClick = () => {
    navigate("/candidate-registration");
  };

  const handleEmployersClick = () => {
    navigate("/employer-vacancy");
  };

  const handleAboutClick = () => {
    onNavigate("about");
  };

  const handleContactClick = () => {
    onNavigate("contact");
  };

  const handleSaasClick = (id: string) => {
    if (id === "pricing") {
      navigate("/pricing");
    } else if (id === "business-dashboard") {
      navigate("/business-login");
    } else if (id === "investor-dashboard") {
      navigate("/investor-login");
    } else {
      onNavigate(id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("home")}>
            <img src={flowpulseLogo} alt="The Flowpulse Group" className="h-14 w-14 rounded-lg object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold">The Flowpulse Group</span>
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

            {/* Direct SaaS Links */}
            {saasItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSaasClick(item.id)}
                className="flex items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </button>
            ))}

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
                    onClick={() => handleRecruitmentClick(item.id)}
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
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/jobs")}>
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button size="sm" onClick={handleCandidatesClick}>
              <User className="h-4 w-4 mr-2" />
              Candidates
            </Button>
            <Button size="sm" onClick={handleEmployersClick}>
              <Building2 className="h-4 w-4 mr-2" />
              Employers
            </Button>
            <Button size="sm" onClick={handleAboutClick}>
              <User className="h-4 w-4 mr-2" />
              About Us
            </Button>
            <Button size="sm" onClick={handleContactClick}>
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

              {/* Direct SaaS Links */}
              {saasItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSaasClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}

              {/* Recruitment Section */}
              <div className="pl-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Recruitment</p>
                {recruitmentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleRecruitmentClick(item.id);
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
                {isAdmin && (
                  <Button size="sm" className="justify-start" onClick={() => {
                    navigate("/admin/jobs");
                    setMobileMenuOpen(false);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button size="sm" className="justify-start" onClick={() => {
                  handleCandidatesClick();
                  setMobileMenuOpen(false);
                }}>
                  <User className="h-4 w-4 mr-2" />
                  Candidates
                </Button>
                <Button size="sm" className="justify-start" onClick={() => {
                  handleEmployersClick();
                  setMobileMenuOpen(false);
                }}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Employers
                </Button>
                <Button size="sm" className="justify-start" onClick={() => {
                  handleContactClick();
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
