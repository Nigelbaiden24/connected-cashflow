import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface MFAChallengeProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function MFAChallenge({ onSuccess, onCancel }: MFAChallengeProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleVerify() {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === "verified");

      if (!totpFactor) {
        toast.error("No MFA factor found");
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) throw verifyError;

      toast.success("MFA verified successfully");
      onSuccess();
    } catch (error: any) {
      console.error("MFA verification failed:", error);
      toast.error(error.message || "Invalid verification code");
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 w-full">
      {/* Left - Branding */}
      <div className="flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white lg:min-h-screen">
        <div>
          <img src={flowpulseLogo} alt="FlowPulse" className="h-12 mb-8" />
          <h1 className="text-3xl font-bold mb-4">Identity Verification</h1>
          <p className="text-lg text-blue-100">
            Enter your authenticator code to access your account securely.
          </p>
        </div>
        <div className="hidden lg:block space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Two-Factor Protected</h3>
              <p className="text-sm text-blue-100">Your account is secured with TOTP authentication</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Time-Based Codes</h3>
              <p className="text-sm text-blue-100">Codes refresh every 30 seconds for maximum security</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block text-sm text-blue-100">
          © 2024 FlowPulse Finance. All rights reserved.
        </div>
      </div>

      {/* Right - Challenge */}
      <div className="flex items-center justify-center p-8 bg-background flex-1">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Enter Verification Code</h2>
            <p className="text-muted-foreground mt-2">
              Open Google Authenticator or Microsoft Authenticator and enter your 6-digit code
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfa-code" className="text-sm font-medium">Verification Code</Label>
            <Input
              id="mfa-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="font-mono text-2xl tracking-[0.5em] text-center h-14"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
          </div>

          <Button
            className="w-full h-11 text-base"
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
          >
            {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Continue
          </Button>
          {onCancel && (
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              Cancel & Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
