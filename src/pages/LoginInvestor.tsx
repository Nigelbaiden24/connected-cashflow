import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Eye, EyeOff, Globe, Coins, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface LoginInvestorProps {
  onLogin: (email: string) => void;
}

const LoginInvestor = ({ onLogin }: LoginInvestorProps) => {
  const navigate = useNavigate();
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
        navigate("/investor/dashboard");
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

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const demoEmail = "investor@flowpulse.com";
    const demoPassword = "demo123456";
    
    try {
      // Try to sign in with demo account
      let { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInError) {
        // If demo account doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: "Investor Demo User",
              platform: "investor"
            }
          }
        });

        if (signUpError) throw signUpError;

        // Check if email confirmation is required
        if (signUpData?.user && !signUpData?.session) {
          toast({
            title: "Email Confirmation Required",
            description: "Please check your email to confirm your account, or disable email confirmation in Supabase settings.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Try to sign in again
        const { data: retryData, error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (retrySignInError) throw retrySignInError;
        data = retryData;
      }

      // Verify we have a valid session
      if (!data?.session) {
        throw new Error("No session created. Please check if email confirmation is enabled in Supabase.");
      }

      toast({
        title: "Demo Login Successful",
        description: `Welcome to FlowPulse Investor demo!`,
      });
      onLogin(demoEmail);
      navigate("/investor/dashboard");
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo Login Error",
        description: error.message || "Failed to login with demo account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding with Purple Theme */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">FlowPulse Investor</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your Global Investment Portal
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Access exclusive research, market intelligence, and investment opportunities worldwide
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">International Markets</h3>
              <p className="text-purple-100">Global stocks, property, and private equity opportunities</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Digital Assets</h3>
              <p className="text-purple-100">Cryptocurrency analysis and investment insights</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Alternative Investments</h3>
              <p className="text-purple-100">Private equity and businesses for sale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your investment portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="investor@example.com"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Try Demo Account
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Demo Account Details:</p>
              <p className="text-muted-foreground">Email: investor@flowpulse.com</p>
              <p className="text-muted-foreground">Password: demo123456</p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have an account? <Button variant="link" className="p-0 h-auto text-purple-600">Contact us</Button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginInvestor;
