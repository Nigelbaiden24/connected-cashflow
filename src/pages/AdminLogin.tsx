import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2, Lock, Eye, EyeOff, BarChart3, Users, Zap } from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email.toLowerCase() !== "nigelbaiden24@yahoo.com") {
        toast.error("Access denied. Only authorized administrators can access this dashboard.");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Login failed");
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img
              src={flowpulseLogo}
              alt="FlowPulse"
              className="h-14 w-14 rounded-xl object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            />
            <div>
              <span className="font-bold text-2xl tracking-tight">FlowPulse</span>
              <span className="block text-xs text-primary font-medium tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Command Centre<br />
            <span className="text-primary">for Administrators</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Manage users, monitor platform activity, and oversee all operations from one secure dashboard.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-primary/20 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">User Management</h3>
              <p className="text-xs text-slate-400">Full control over user accounts, roles, and permissions</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-primary/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Platform Analytics</h3>
              <p className="text-xs text-slate-400">Real-time insights into system performance and usage</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-primary/20 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">System Controls</h3>
              <p className="text-xs text-slate-400">Configure automation rules, workflows, and integrations</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} FlowPulse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={flowpulseLogo}
              alt="FlowPulse"
              className="h-12 mx-auto mb-3 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="text-xs text-primary font-medium tracking-widest uppercase">Admin Portal</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Shield className="h-3.5 w-3.5" />
              Secure Admin Access
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in with your administrator credentials
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@flowpulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-muted/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 pr-10 bg-muted/50 border-border focus:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign in to Admin Portal
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Protected by enterprise-grade security · MFA enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
