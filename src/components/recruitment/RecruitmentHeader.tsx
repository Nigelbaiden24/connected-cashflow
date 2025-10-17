import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Code, 
  TrendingUp, 
  Building2,
  User,
  Phone
} from "lucide-react";

interface RecruitmentHeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function RecruitmentHeader({ onNavigate, currentSection }: RecruitmentHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "tech", label: "Technology", icon: Code },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "general", label: "All Sectors", icon: Building2 },
    { id: "login", label: "Flowpulse Finance", icon: TrendingUp },
    { id: "business-dashboard", label: "Flowpulse Business", icon: Building2 },
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
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  currentSection === item.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("candidate-register")}>
              <User className="h-4 w-4 mr-2" />
              For Candidates
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("employer-register")}>
              <Building2 className="h-4 w-4 mr-2" />
              For Employers
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
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    currentSection === item.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => {
                  onNavigate("candidate-register");
                  setMobileMenuOpen(false);
                }}>
                  <User className="h-4 w-4 mr-2" />
                  For Candidates
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => {
                  onNavigate("employer-register");
                  setMobileMenuOpen(false);
                }}>
                  <Building2 className="h-4 w-4 mr-2" />
                  For Employers
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
