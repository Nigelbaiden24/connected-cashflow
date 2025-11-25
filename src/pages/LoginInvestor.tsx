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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Logged in as ${email}`,
        });
        onLogin(email);
        navigate("/investor/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
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

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have an account? <Button variant="link" className="p-0 h-auto text-purple-600">Contact us</Button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginInvestor;
