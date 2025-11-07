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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding with Green Theme */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] opacity-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-400/20 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <img 
            src={flowpulseLogo} 
            alt="FlowPulse Business" 
            className="h-16 mb-8 cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => window.location.href = '/'}
          />
          <h1 className="text-5xl font-bold mb-4">Welcome to FlowPulse Business</h1>
          <p className="text-xl text-green-100 mb-8">
            Your complete business management platform for modern teams
          </p>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Team Collaboration</h3>
              <p className="text-sm text-green-100">Manage projects, tasks, and team communications in one place</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Business Analytics</h3>
              <p className="text-sm text-green-100">Real-time insights and reporting for data-driven decisions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Automated Workflows</h3>
              <p className="text-sm text-green-100">Streamline processes with intelligent automation tools</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-green-100">
          © 2024 FlowPulse Business. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <img 
              src={flowpulseLogo} 
              alt="FlowPulse Business" 
              className="h-10 mx-auto mb-4 cursor-pointer" 
              onClick={() => window.location.href = '/'}
            />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2">
              Access your business dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Work Email
              </Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
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
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
              <span className="bg-background px-2 text-muted-foreground">
                Demo access
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-500/30 hover:bg-green-500/10"
            onClick={handleDemoLogin}
          >
            <Building2 className="h-4 w-4 mr-2 text-green-600" />
            Try Demo Account
          </Button>

          <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="text-xs font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground font-mono">
              business@flowpulse.com / business2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBusiness;
