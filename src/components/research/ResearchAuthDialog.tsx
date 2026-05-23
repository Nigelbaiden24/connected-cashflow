import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
  reportTitle?: string;
}

export function ResearchAuthDialog({ open, onOpenChange, redirectPath, reportTitle }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    onOpenChange(false);
    if (redirectPath) window.location.href = redirectPath;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) {
      toast.error("Password must be at least 10 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectPath ?? "/research"}`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm your account");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-slate-200 max-w-4xl w-[95vw] bg-white">
        <DialogTitle className="sr-only">Sign in or create account to unlock this report</DialogTitle>
        <DialogDescription className="sr-only">
          Create a free FlowPulse account or sign in to access the full research report.
        </DialogDescription>
        <div className="grid md:grid-cols-2">
          {/* Left brand panel */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-10 text-white overflow-hidden">
            <div className="pointer-events-none absolute -top-32 -left-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]" />

            <div className="relative">
              <div className="flex items-center gap-2.5">
                <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
                <span className="font-semibold tracking-tight">FlowPulse</span>
              </div>
              <div className="mt-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-amber-300">
                  <Sparkles className="h-3 w-3" /> Research Vault
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight leading-tight">
                  Institutional-grade<br />research, unlocked.
                </h2>
                {reportTitle && (
                  <p className="mt-4 text-sm text-slate-300/90">
                    You're one step away from <span className="text-amber-300 font-medium">{reportTitle}</span>.
                  </p>
                )}
              </div>
            </div>

            <div className="relative space-y-3 text-sm">
              <Feature icon={<TrendingUp className="h-4 w-4" />} text="Full equity & crypto deep-dives" />
              <Feature icon={<ShieldCheck className="h-4 w-4" />} text="0–5 conviction scoring framework" />
              <Feature icon={<Lock className="h-4 w-4" />} text="Bank-grade security · MFA available" />
            </div>
          </div>

          {/* Right form panel */}
          <div className="p-8 md:p-10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {mode === "signin" ? "Sign in to continue" : "Create your account"}
              </h3>
              <p className="text-sm text-slate-500 mt-1.5">
                {mode === "signin"
                  ? "Access the full research desk and live coverage."
                  : "Free account · Cancel anytime · No card required."}
              </p>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-slate-100 p-1 h-auto">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Create account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} required />
                  <Field id="si-password" label="Password" type="password" value={password} onChange={setPassword} required />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Field id="su-name" label="Full name" type="text" value={fullName} onChange={setFullName} required />
                  <Field id="su-email" label="Work email" type="email" value={email} onChange={setEmail} required />
                  <Field id="su-password" label="Password (min. 10 characters)" type="password" value={password} onChange={setPassword} required />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                  </Button>
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    By creating an account, you agree to FlowPulse's Terms of Service and Privacy Policy.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-200">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-amber-300">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

function Field({
  id, label, type, value, onChange, required,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-slate-500">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-11 bg-white border-slate-200 focus-visible:ring-amber-400/40 focus-visible:border-amber-400"
      />
    </div>
  );
}
