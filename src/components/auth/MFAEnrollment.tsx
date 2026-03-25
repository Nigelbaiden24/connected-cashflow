import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Smartphone, Copy, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

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
      // Clean up any existing unverified factors first
      const { data: existingFactors } = await supabase.auth.mfa.listFactors();
      if (existingFactors?.totp) {
        for (const factor of existingFactors.totp) {
          if (factor.status === "unverified") {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "FlowPulse Authenticator",
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

      toast.success("Authenticator set up successfully!");
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
    toast.success("Secret key copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "intro") {
    return (
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        {/* Left - Branding */}
        <div className="flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white lg:min-h-screen">
          <div>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-12 mb-8" />
            <h1 className="text-3xl font-bold mb-4">Secure Your Account</h1>
            <p className="text-lg text-blue-100">
              Two-factor authentication is required for all FlowPulse Finance accounts.
            </p>
          </div>
          <div className="hidden lg:block space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Authenticator App</h3>
                <p className="text-sm text-blue-100">Works with Google Authenticator & Microsoft Authenticator</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enterprise Security</h3>
                <p className="text-sm text-blue-100">TOTP-based verification protects against unauthorized access</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">One-Time Setup</h3>
                <p className="text-sm text-blue-100">Set up once, then enter a code each time you sign in</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block text-sm text-blue-100">
            © 2024 FlowPulse Finance. All rights reserved.
          </div>
        </div>

        {/* Right - Setup */}
        <div className="flex items-center justify-center p-8 bg-background flex-1">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Set Up Authenticator</h2>
              <p className="text-muted-foreground mt-2">
                Follow these steps to enable two-factor authentication
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium">Download an authenticator app</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Install Google Authenticator or Microsoft Authenticator from your app store
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium">Scan the QR code</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Use your authenticator app to scan the code we'll show you
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <p className="text-sm font-medium">Enter verification code</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Type the 6-digit code from your app to activate
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full h-11 text-base" onClick={startEnrollment} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Begin Setup
            </Button>
            {onCancel && (
              <Button variant="ghost" className="w-full" onClick={onCancel}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-8 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white lg:min-h-screen">
          <img src={flowpulseLogo} alt="FlowPulse" className="h-10 mb-6" />
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            {qrCode && (
              <img src={qrCode} alt="Scan this QR code with your authenticator app" className="w-56 h-56" />
            )}
          </div>
          <p className="text-blue-100 text-sm mt-6 text-center max-w-xs">
            Point your authenticator app's camera at the QR code above
          </p>
        </div>

        <div className="flex items-center justify-center p-8 bg-background flex-1">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Scan QR Code</h2>
              <p className="text-muted-foreground mt-2">
                Open your authenticator app and scan the QR code shown on the left
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Can't scan? Enter this key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2.5 rounded font-mono break-all select-all">
                    {secret}
                  </code>
                  <Button variant="outline" size="sm" onClick={copySecret} className="flex-shrink-0">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button className="w-full h-11 text-base" onClick={() => setStep("verify")}>
              I've Scanned the Code — Next
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("intro")}>
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Verify step
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white lg:min-h-screen">
        <div>
          <img src={flowpulseLogo} alt="FlowPulse" className="h-12 mb-8" />
          <h1 className="text-3xl font-bold mb-4">Almost There!</h1>
          <p className="text-lg text-blue-100">
            Enter the 6-digit code from your authenticator app to complete setup.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <Shield className="h-8 w-8 flex-shrink-0" />
          <div>
            <p className="font-semibold">Codes refresh every 30 seconds</p>
            <p className="text-sm text-blue-100">Make sure to enter the current code shown in your app</p>
          </div>
        </div>
        <div className="hidden lg:block text-sm text-blue-100">
          © 2024 FlowPulse Finance. All rights reserved.
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background flex-1">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Verify Code</h2>
            <p className="text-muted-foreground mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-code" className="text-sm font-medium">Verification Code</Label>
            <Input
              id="verify-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="font-mono text-2xl tracking-[0.5em] text-center h-14"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && verifyAndActivate()}
            />
          </div>

          <Button
            className="w-full h-11 text-base"
            onClick={verifyAndActivate}
            disabled={loading || code.length !== 6}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Activate
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("setup")}>
            Back to QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}
