import { createRoot } from "react-dom/client";
import { TranslationProvider } from "./contexts/TranslationContext";
import App from "./App.tsx";
import "./index.css";

// PWA Service Worker guard: prevent SW registration in iframes or preview hosts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

// Detect standalone mode and set class on html for CSS targeting
if (
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true
) {
  document.documentElement.classList.add("pwa-standalone");
}

createRoot(document.getElementById("root")!).render(
  <TranslationProvider>
    <App />
  </TranslationProvider>
);
