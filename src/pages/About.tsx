import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, Loader2 } from "lucide-react";
import { INSIGHT_CATEGORIES } from "@/lib/insightCategories";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const AboutFlowpulse = lazy(() =>
  import("@/components/recruitment/AboutFlowpulse").then((m) => ({ default: m.AboutFlowpulse }))
);

const About = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleNavigate = (section: string) => {
    if (section === "home") navigate("/");
    else if (section === "contact") navigate("/contact");
    else navigate(`/${section}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Site-wide header (matches homepage) */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center relative">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl">FlowPulse</span>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-auto">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
                  FlowPulse
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>FlowPulse Finance</Button>
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/login-investor"); setMobileMenuOpen(false); }}>FlowPulse Investor</Button>
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }}>Pricing</Button>
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/reports"); setMobileMenuOpen(false); }}>Insights</Button>
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/about"); setMobileMenuOpen(false); }}>About</Button>
                <Button variant="ghost" className="w-full justify-start font-semibold" onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }}>Contact</Button>
              </div>
            </SheetContent>
          </Sheet>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <button onClick={() => navigate("/login")} className="text-muted-foreground text-base font-medium tracking-wide transition-colors hover:text-primary">FlowPulse Finance</button>
            <button onClick={() => navigate("/login-investor")} className="text-muted-foreground text-base font-medium tracking-wide transition-colors hover:text-primary">FlowPulse Investor</button>
            <button onClick={() => navigate("/pricing")} className="text-muted-foreground text-base font-medium tracking-wide transition-colors hover:text-primary">Pricing</button>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-muted-foreground text-base font-medium tracking-wide transition-colors hover:text-primary flex items-center gap-1 outline-none">
                Insights
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[640px] max-w-[92vw] bg-background border shadow-2xl rounded-xl p-3 z-50">
                <DropdownMenuLabel className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm font-semibold">Browse by category</span>
                  <button onClick={() => navigate("/reports")} className="text-xs font-semibold text-primary hover:underline">View all Insights →</button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto">
                  {INSIGHT_CATEGORIES.map((cat) => (
                    <DropdownMenuItem
                      key={cat.value}
                      onClick={() => navigate(`/reports?category=${encodeURIComponent(cat.value)}`)}
                      className="cursor-pointer rounded-md px-2.5 py-2"
                    >
                      <span className="text-lg mr-2 leading-none">{cat.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{cat.label}</span>
                        <span className="text-xs text-muted-foreground truncate">{cat.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={() => navigate("/about")} className="text-primary text-base font-semibold tracking-wide">About</button>
            <button onClick={() => navigate("/contact")} className="text-muted-foreground text-base font-medium tracking-wide transition-colors hover:text-primary">Contact</button>
          </nav>

          <div className="ml-auto hidden md:block" />
        </div>
      </header>

      {/* About content (lazy-loaded for fast initial paint) */}
      <Suspense
        fallback={
          <div className="container mx-auto px-6 py-32 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <AboutFlowpulse onNavigate={handleNavigate} />
      </Suspense>
    </div>
  );
};

export default About;
