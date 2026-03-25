import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your Google Authenticator or Microsoft Authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="font-mono text-lg tracking-widest text-center mt-2"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
        </div>
        <Button className="w-full" onClick={handleVerify} disabled={verifying || code.length !== 6}>
          {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
        {onCancel && (
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
