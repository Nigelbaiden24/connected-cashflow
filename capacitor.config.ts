import type { CapacitorConfig } from "@capacitor/cli";

// appId uk.co.flowpulse.app is provisional until confirmed — it cannot change after the first Play Store upload.
const config: CapacitorConfig = {
  appId: "uk.co.flowpulse.app",
  appName: "FlowPulse",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "native",
    },
  },
};

export default config;
