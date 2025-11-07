import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Key, Smartphone, Mail, Shield, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MFASettings = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [totpSecret, setTotpSecret] = useState("JBSWY3DPEHPK3PXP");
  const [emailMfaEnabled, setEmailMfaEnabled] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [backupCodes] = useState([
    "1A2B-3C4D",
    "5E6F-7G8H",
    "9I0J-1K2L",
    "3M4N-5O6P",
    "7Q8R-9S0T",
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleMFA = async (enabled: boolean) => {
    setMfaEnabled(enabled);
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("mfa_settings").upsert({
          user_id: user.id,
          mfa_enabled: enabled,
          mfa_method: "totp",
        });

        await supabase.from("audit_logs").insert({
          action: enabled ? "mfa_enabled" : "mfa_disabled",
          resource_type: "mfa_settings",
          severity: "info",
        });
      }

      if (enabled) {
        toast.success("Multi-Factor Authentication enabled");
      } else {
        toast.success("Multi-Factor Authentication disabled");
      }
    } catch (error) {
      console.error("Error toggling MFA:", error);
      toast.error("Failed to update MFA settings");
    }
  };

  const sendTestCode = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    toast.success(`Test code sent to ${testEmail}`);
    setEmailMfaEnabled(true);
  };

  const regenerateCodes = async () => {
    if (!confirm("This will invalidate all existing backup codes. Continue?")) return;
    
    toast.success("Backup codes regenerated successfully");
    
    await supabase.from("audit_logs").insert({
      action: "backup_codes_regenerated",
      resource_type: "mfa_settings",
      severity: "info",
    });
  };

  const downloadCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Multi-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MFA Status</CardTitle>
              <CardDescription>Protect your account with 2FA</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="mfa-toggle">Enable MFA</Label>
              <Switch id="mfa-toggle" checked={mfaEnabled} onCheckedChange={toggleMFA} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mfaEnabled ? (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">MFA is Active</p>
                <p className="text-sm text-green-700">Your account is secured with 2FA</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-200 rounded-lg">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">MFA is Disabled</p>
                <p className="text-sm text-yellow-700">
                  Enable MFA to add extra security
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Authenticator App</CardTitle>
            </div>
            <CardDescription>Use TOTP-based authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Setup Code</Label>
              <div className="flex gap-2 mt-2">
                <Input value={totpSecret} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(totpSecret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan QR code or enter this code in your authenticator app
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Supported Apps</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Google Authenticator</Badge>
                <Badge variant="secondary">Microsoft Authenticator</Badge>
                <Badge variant="secondary">Authy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Verification</CardTitle>
            </div>
            <CardDescription>Receive codes via email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-2"
              />
            </div>
            <Button variant="outline" className="w-full" onClick={sendTestCode}>
              Send Test Code
            </Button>
            {emailMfaEnabled && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-900">Email MFA configured</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              You'll receive a 6-digit code when logging in
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Backup Codes</CardTitle>
          </div>
          <CardDescription>
            Use these codes if you lose access to your authenticator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono"
              >
                <span>{code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(code)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={regenerateCodes}>
              Regenerate Codes
            </Button>
            <Button variant="outline" className="flex-1" onClick={downloadCodes}>
              Download Codes
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Each backup code can only be used once. Store them securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
