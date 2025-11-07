import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Eye, EyeOff, Lock, Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
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
    setEmail("finance@flowpulse.com");
    setPassword("finance2024");
    toast({
      title: "Demo Credentials Loaded",
      description: "Click Sign In to continue with demo account",
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div>
          <img src={flowpulseLogo} alt="FlowPulse Finance" className="h-12 mb-8" />
          <h1 className="text-4xl font-bold mb-4">Welcome to FlowPulse Finance</h1>
          <p className="text-xl text-blue-100 mb-8">
            Your intelligent financial advisory platform for wealth management excellence
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Advanced Portfolio Management</h3>
              <p className="text-sm text-blue-100">Track and optimize client investments with real-time analytics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Bank-Level Security</h3>
              <p className="text-sm text-blue-100">SOC 2 Compliant & FINRA Approved infrastructure</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Compliance Ready</h3>
              <p className="text-sm text-blue-100">Built-in regulatory compliance and reporting tools</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-blue-100">
          © 2024 FlowPulse Finance. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <img src={flowpulseLogo} alt="FlowPulse Finance" className="h-10 mx-auto mb-4" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2">
              Access your financial advisory dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="advisor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use demo account
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleDemoLogin}
          >
            Load Demo Credentials
          </Button>
          
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">Demo Account Details:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Email: <span className="font-mono">finance@flowpulse.com</span></p>
              <p>Password: <span className="font-mono">finance2024</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;