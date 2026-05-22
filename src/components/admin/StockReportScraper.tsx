import { TrendingUp } from "lucide-react";
import { AIResearchScraperPanel } from "./AIResearchScraperPanel";

export function StockReportScraper() {
  return (
    <AIResearchScraperPanel
      assetType="stock"
      title="Stock Report Scraper"
      description="AI scrapes the open web + curated equity sources (SEC EDGAR, Yahoo, MarketWatch, FT, Seeking Alpha) and drafts a Cryptonary-style FlowPulse research report. Review and promote to Stock Research Reports on the Investor frontend."
      iconGradient="from-blue-500 to-cyan-600"
      Icon={TrendingUp}
    />
  );
}
