import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, Users, BarChart3, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface LoginBusinessProps {
  onLogin: (email: string) => void;
}

const LoginBusiness = ({ onLogin }: LoginBusinessProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Logged in as ${email}`,
        });
        onLogin(email);
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter both email and password.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleDemoLogin = () => {
    setEmail("business@flowpulse.com");
    setPassword("business2024");
    toast({
      title: "Demo Credentials Loaded",
      description: "Click Sign In to continue with demo account",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={flowpulseLogo} alt="FlowPulse Business" className="h-8" />
            <div className="h-6 w-px bg-border" />
            <span className="font-semibold text-lg">Business</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Need help? <button className="text-primary hover:underline">Contact Support</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-12 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                Streamline Your Business Operations
              </h1>
              <p className="text-xl text-muted-foreground">
                Complete business management platform designed for modern teams
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex gap-4 p-4 rounded-lg bg-card border">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage projects, tasks, and team communications in one place
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-card border">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time insights and reporting for data-driven decisions
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-card border">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Automated Workflows</h3>
                  <p className="text-sm text-muted-foreground">
                    Streamline processes with intelligent automation tools
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>All Systems Operational</span>
              </div>
              <div>99.9% Uptime</div>
              <div>ISO 27001 Certified</div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="bg-card border rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                <p className="text-muted-foreground">
                  Sign in to access your business dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in to workspace"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Demo access
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Try Demo Account
              </Button>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-muted-foreground font-mono">
                  business@flowpulse.com / business2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2024 FlowPulse Business. Enterprise-grade security and compliance.
        </div>
      </footer>
    </div>
  );
};

export default LoginBusiness;
