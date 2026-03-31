import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Don't show if user dismissed recently (24h cooldown)
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt || !deferredPrompt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-3 right-3 z-[55] md:left-auto md:right-4 md:bottom-4 md:max-w-sm",
        "safe-area-bottom",
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300"
      )}
    >
      <div className="rounded-2xl border border-border bg-card/98 backdrop-blur-xl shadow-2xl shadow-primary/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">Install FlowPulse</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Add to home screen for instant access & offline support
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 h-9 text-xs font-medium rounded-xl"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-9 w-9 p-0 rounded-xl text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
