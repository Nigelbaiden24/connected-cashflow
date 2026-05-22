import { Bitcoin } from "lucide-react";
import { AIResearchScraperPanel } from "./AIResearchScraperPanel";

export function CryptoReportScraper() {
  return (
    <AIResearchScraperPanel
      assetType="crypto"
      title="Crypto Report Scraper"
      description="AI scrapes the open web + curated digital-asset sources (CoinDesk, Decrypt, CoinTelegraph, Messari, DeFiLlama) and drafts a Cryptonary-style FlowPulse research report. Review and promote to Crypto Research Reports on the Investor frontend."
      iconGradient="from-orange-500 to-yellow-600"
      Icon={Bitcoin}
    />
  );
}
