import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Smartphone, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MFAEnrollmentProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function MFAEnrollment({ onSuccess, onCancel }: MFAEnrollmentProps) {
  const [step, setStep] = useState<"intro" | "setup" | "verify">("intro");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startEnrollment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("setup");
    } catch (error: any) {
      console.error("MFA enrollment error:", error);
      toast.error(error.message || "Failed to start MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndActivate = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) throw verifyError;

      toast.success("Authenticator set up successfully! MFA is now active.");
      onSuccess();
    } catch (error: any) {
      console.error("MFA verification error:", error);
      toast.error(error.message || "Invalid code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "intro") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl">Two-Factor Authentication Required</CardTitle>
          <CardDescription className="text-sm mt-2">
            For your security, all FlowPulse Finance accounts require two-factor authentication. 
            Set up Google Authenticator or Microsoft Authenticator to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Step 1</p>
                <p className="text-xs text-muted-foreground">
                  Download Google Authenticator or Microsoft Authenticator on your phone
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Step 2</p>
                <p className="text-xs text-muted-foreground">
                  Scan the QR code with your authenticator app
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Step 3</p>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code to verify and activate
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={startEnrollment} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Up Authenticator
          </Button>
          {onCancel && (
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              Sign Out
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === "setup") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Open Google Authenticator or Microsoft Authenticator and scan this QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Can't scan? Enter this key manually:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted p-2 rounded font-mono break-all">
                {secret}
              </code>
              <Button variant="outline" size="sm" onClick={copySecret}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button className="w-full" onClick={() => setStep("verify")}>
            I've Scanned the Code
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <CardTitle>Verify Authenticator</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app to complete setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="verify-code">Verification Code</Label>
          <Input
            id="verify-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="font-mono text-lg tracking-widest text-center mt-2"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && verifyAndActivate()}
          />
        </div>
        <Button className="w-full" onClick={verifyAndActivate} disabled={loading || code.length !== 6}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify & Activate
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep("setup")}>
          Back to QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
