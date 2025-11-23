import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle2, ArrowLeft } from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Install FlowPulse</CardTitle>
          <CardDescription>
            Get the best experience with our mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {installed ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Already Installed!</h3>
                <p className="text-sm text-muted-foreground">
                  FlowPulse is already installed on your device. You can find it on your home screen.
                </p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Download className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-center">Install for Quick Access</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Install FlowPulse to your home screen for faster access and a native app experience
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Works Offline</p>
                    <p className="text-xs text-muted-foreground">Access your data without internet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Fast Loading</p>
                    <p className="text-xs text-muted-foreground">Instant startup and quick responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Home Screen Access</p>
                    <p className="text-xs text-muted-foreground">Launch directly from your phone</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Install Now
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Maybe Later
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Smartphone className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-center">Install from Browser</h3>
                <p className="text-sm text-muted-foreground text-center">
                  To install FlowPulse on your device:
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-1">On iPhone/Safari:</p>
                  <p className="text-muted-foreground">
                    Tap the Share button <span className="inline-block px-1">↗</span> → "Add to Home Screen"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-1">On Android/Chrome:</p>
                  <p className="text-muted-foreground">
                    Tap the menu (⋮) → "Install app" or "Add to Home screen"
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
