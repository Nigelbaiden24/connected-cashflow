// Shared category configuration for Insights (lead magnet reports)
// Used by PublicReports page AND admin PurchasableReportUpload to ensure
// uploaded reports land in exactly the right category card.

export interface InsightCategory {
  value: string;
  label: string;
  emoji: string;
  description: string;
  // Aliases used to map legacy / variant category strings to this category
  aliases: string[];
}

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  {
    value: "Stocks & Equities",
    label: "Stocks & Equities",
    emoji: "📈",
    description: "Listed equities, IPOs & secondary offerings",
    aliases: ["stocks", "equity", "equities", "ipo", "shares"],
  },
  {
    value: "Crypto & Digital Assets",
    label: "Crypto & Digital Assets",
    emoji: "₿",
    description: "Cryptocurrency and blockchain investments",
    aliases: ["crypto", "digital asset", "blockchain", "bitcoin", "ethereum"],
  },
  {
    value: "Real Estate",
    label: "Real Estate",
    emoji: "🏢",
    description: "Commercial & residential property deals",
    aliases: ["real estate", "property", "reit"],
  },
  {
    value: "Fixed Income & Bonds",
    label: "Fixed Income & Bonds",
    emoji: "📊",
    description: "Government & corporate bonds",
    aliases: ["bond", "fixed income", "gilts", "treasuries", "credit"],
  },
  {
    value: "Commodities",
    label: "Commodities",
    emoji: "⛏️",
    description: "Gold, oil, agriculture & natural resources",
    aliases: ["commodity", "gold", "oil", "metals", "agriculture"],
  },
  {
    value: "Foreign Exchange",
    label: "Foreign Exchange",
    emoji: "💱",
    description: "FX opportunities & currency markets",
    aliases: ["fx", "forex", "currency", "foreign exchange"],
  },
  {
    value: "Funds & ETFs",
    label: "Funds & ETFs",
    emoji: "📋",
    description: "Fund analysis, scoring & selection",
    aliases: ["fund", "etf", "mutual fund", "index fund"],
  },
  {
    value: "Alternative Investments",
    label: "Alternative Investments",
    emoji: "🎨",
    description: "Hedge funds, art, wine & collectibles",
    aliases: ["alternative", "hedge fund", "art", "wine", "collectibles"],
  },
  {
    value: "ESG & Impact Investing",
    label: "ESG & Impact Investing",
    emoji: "🌱",
    description: "Sustainable & socially responsible opportunities",
    aliases: ["esg", "impact", "sustainable", "green", "responsible"],
  },
  {
    value: "Fractional Private Equity / VC",
    label: "Fractional Private Equity / VC",
    emoji: "💎",
    description: "Crowdfunding, syndicates & fractional deals",
    aliases: ["private equity", "venture capital", "vc", "crowdfunding", "syndicate", "fractional"],
  },
  {
    value: "Private Market Platforms",
    label: "Private Market Platforms",
    emoji: "🔁",
    description: "Secondary shares & pre-IPO marketplaces",
    aliases: ["private market", "secondary", "pre-ipo", "marketplace"],
  },
  {
    value: "Derivatives",
    label: "Derivatives",
    emoji: "📐",
    description: "Options, futures, swaps & structured derivatives",
    aliases: ["derivative", "option", "future", "swap", "structured"],
  },
  {
    value: "Capital-Protected & Income Notes",
    label: "Capital-Protected & Income Notes",
    emoji: "🛡️",
    description: "Structured notes with capital protection or income",
    aliases: ["capital protected", "income note", "structured note"],
  },
  {
    value: "Savings, Cash & Yield Products",
    label: "Savings, Cash & Yield Products",
    emoji: "💰",
    description: "High-yield savings, money market & cash equivalents",
    aliases: ["savings", "cash", "yield", "money market", "deposit"],
  },
  {
    value: "Pensions & Tax Wrappers",
    label: "Pensions & Tax Wrappers",
    emoji: "🧾",
    description: "SIPPs, ISAs & tax-efficient investment vehicles",
    aliases: ["pension", "sipp", "isa", "tax wrapper", "tax efficient"],
  },
  {
    value: "Thematics & Packaged Investing",
    label: "Thematics & Packaged Investing",
    emoji: "📦",
    description: "Thematic baskets & packaged investment products",
    aliases: ["thematic", "packaged", "basket", "theme"],
  },
  {
    value: "Copy Trading",
    label: "Copy Trading",
    emoji: "👥",
    description: "Mirror & social trading strategies",
    aliases: ["copy trading", "mirror trading", "social trading"],
  },
];

/**
 * Map any incoming category string to the canonical INSIGHT_CATEGORIES value.
 * Falls back to "Stocks & Equities" if no match is found.
 */
export function mapToInsightCategory(raw: string | null | undefined): string {
  if (!raw) return "Stocks & Equities";
  const lower = raw.toLowerCase().trim();

  // Exact match first
  const exact = INSIGHT_CATEGORIES.find((c) => c.value.toLowerCase() === lower);
  if (exact) return exact.value;

  // Alias / partial match
  for (const cat of INSIGHT_CATEGORIES) {
    if (cat.aliases.some((a) => lower.includes(a) || a.includes(lower))) {
      return cat.value;
    }
  }
  return "Stocks & Equities";
}

export function getInsightCategory(value: string): InsightCategory | undefined {
  return INSIGHT_CATEGORIES.find((c) => c.value === value);
}
