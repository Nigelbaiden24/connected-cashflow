import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Key, Smartphone, Shield, Copy, CheckCircle, Loader2, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "@/utils/loginActivity";

export const MFAEnrollment = () => {
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [mfaActive, setMfaActive] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupCodes] = useState<string[]>([]);

  // Check existing MFA status on mount
  useState(() => {
    checkMfaStatus();
  });

  async function checkMfaStatus() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totp = data?.totp || [];
      setFactors(totp);
      setMfaActive(totp.some((f: any) => f.status === "verified"));
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function startEnrollment() {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
    } catch (error: any) {
      console.error("MFA enrollment error:", error);
      toast.error(error.message || "Failed to start MFA enrollment");
    } finally {
      setEnrolling(false);
    }
  }

  async function verifyEnrollment() {
    if (!factorId || !verifyCode) {
      toast.error("Please enter the verification code");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });
      if (error) throw error;

      setMfaActive(true);
      setQrCode(null);
      setTotpSecret(null);
      setFactorId(null);
      setVerifyCode("");
      toast.success("MFA enabled successfully");
      await logAuditEvent("mfa_enrolled", "mfa_settings", "info");
      await checkMfaStatus();
    } catch (error: any) {
      console.error("MFA verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  }

  async function unenrollMFA(fId: string) {
    if (!confirm("Are you sure you want to disable MFA? This will reduce your account security.")) return;
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: fId });
      if (error) throw error;
      setMfaActive(false);
      toast.success("MFA disabled");
      await logAuditEvent("mfa_unenrolled", "mfa_settings", "warning");
      await checkMfaStatus();
    } catch (error: any) {
      toast.error(error.message || "Failed to disable MFA");
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Multi-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account using TOTP
        </p>
      </div>

      {/* MFA Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MFA Status</CardTitle>
              <CardDescription>Protect your account with 2FA</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mfaActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-300">MFA is Active</p>
                  <p className="text-sm text-green-700 dark:text-green-400">Your account is secured with TOTP</p>
                </div>
              </div>
              {factors.filter((f) => f.status === "verified").map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{f.friendly_name || "Authenticator App"}</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => unenrollMFA(f.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-200 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-300">MFA is Disabled</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Enable MFA to add extra security</p>
                </div>
              </div>
              {!qrCode && (
                <Button onClick={startEnrollment} disabled={enrolling}>
                  {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <QrCode className="mr-2 h-4 w-4" />
                  Set Up Authenticator App
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Flow */}
      {qrCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Set Up Authenticator</CardTitle>
            </div>
            <CardDescription>
              Scan the QR code with your authenticator app, then enter the verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            </div>

            {totpSecret && (
              <div>
                <Label>Manual Setup Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={totpSecret} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(totpSecret)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter this code manually if you can't scan the QR code
                </p>
              </div>
            )}

            <Separator />

            <div>
              <Label>Verification Code</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-lg tracking-widest"
                />
                <Button onClick={verifyEnrollment} disabled={verifying || verifyCode.length !== 6}>
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Google Authenticator</Badge>
              <Badge variant="secondary">Microsoft Authenticator</Badge>
              <Badge variant="secondary">Authy</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {mfaActive && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Recovery Options</CardTitle>
            </div>
            <CardDescription>
              If you lose access to your authenticator app, contact your administrator for account recovery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Backup recovery codes are managed securely in the vault. Contact support if you need to recover your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
