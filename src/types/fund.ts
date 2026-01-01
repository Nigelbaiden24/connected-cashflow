// Comprehensive Fund & ETF Type Definitions for UK IFA Platform

export interface FundMaster {
  // Core identifiers
  isin: string;
  ticker?: string;
  sedol?: string;
  name: string;
  
  // Provider & Structure
  provider: string;
  structure: 'Active' | 'Passive' | 'Smart Beta';
  fundType: 'OEIC' | 'ETF' | 'Unit Trust' | 'Investment Trust' | 'SICAV';
  domicile: string;
  currency: string;
  ucitsStatus: boolean;
  launchDate: string;
  shareClass: 'Accumulating' | 'Income' | 'Both';
  
  // Classification
  category: string;
  subcategory?: string;
  assetClass: 'Equity' | 'Fixed Income' | 'Multi-Asset' | 'Alternatives' | 'Money Market' | 'Commodity';
  
  // Size & Liquidity
  aum: number; // in millions
  aumCurrency: string;
  
  // Status
  status: 'Open' | 'Soft Close' | 'Hard Close' | 'Liquidating';
}

export interface FundPerformance {
  // Returns
  dailyNav: number;
  navDate: string;
  ytdReturn: number;
  oneMonthReturn: number;
  threeMonthReturn: number;
  sixMonthReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn?: number;
  sinceInceptionReturn: number;
  
  // Rolling returns (annualized)
  rollingOneYear: number[];
  rollingThreeYear: number[];
  
  // Benchmark comparison
  benchmarkName: string;
  benchmarkReturn1Y: number;
  benchmarkReturn3Y: number;
  benchmarkReturn5Y: number;
  excessReturn1Y: number;
  excessReturn3Y: number;
  excessReturn5Y: number;
  
  // Quartile ranking
  quartileRank1Y: 1 | 2 | 3 | 4;
  quartileRank3Y: 1 | 2 | 3 | 4;
  quartileRank5Y: 1 | 2 | 3 | 4;
}

export interface FundRiskMetrics {
  // Core risk
  volatility1Y: number;
  volatility3Y: number;
  volatility5Y: number;
  
  // Risk-adjusted
  sharpeRatio1Y: number;
  sharpeRatio3Y: number;
  sharpeRatio5Y: number;
  sortinoRatio1Y: number;
  sortinoRatio3Y: number;
  
  // Drawdown
  maxDrawdown: number;
  maxDrawdownDate: string;
  currentDrawdown: number;
  
  // Market sensitivity
  alpha3Y: number;
  beta3Y: number;
  rSquared: number;
  trackingError: number;
  informationRatio: number;
  
  // Downside
  downsideDeviation: number;
  downsideCaptureRatio: number;
  upsideCaptureRatio: number;
  
  // Risk rating (1-7 SRRI scale)
  srriRating: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface FundCosts {
  // UK-specific fees
  ocf: number; // Ongoing Charges Figure
  amc: number; // Annual Management Charge
  transactionCosts: number;
  performanceFee?: number;
  performanceFeeHurdle?: string;
  entryFee: number;
  exitFee: number;
  
  // Total cost
  totalCostOfOwnership: number;
  
  // Platform discounts
  platformDiscountAvailable: boolean;
  
  // Fee history
  ocfHistory: { date: string; ocf: number }[];
}

export interface FundHolding {
  name: string;
  isin?: string;
  weight: number;
  sector?: string;
  country?: string;
  currency?: string;
}

export interface FundExposure {
  // Top holdings
  topHoldings: FundHolding[];
  numberOfHoldings: number;
  top10Weight: number;
  
  // Sector breakdown
  sectorExposure: { sector: string; weight: number }[];
  
  // Regional breakdown
  regionExposure: { region: string; weight: number }[];
  
  // Asset class breakdown (for multi-asset)
  assetClassExposure: { assetClass: string; weight: number }[];
  
  // Currency exposure
  currencyExposure: { currency: string; weight: number }[];
  
  // For fixed income
  creditQualityBreakdown?: { rating: string; weight: number }[];
  durationYears?: number;
  yieldToMaturity?: number;
  averageCreditRating?: string;
  
  // ESG
  esgRating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  carbonIntensity?: number;
  sustainabilityScore?: number;
}

export interface FundClassification {
  // Equity style (for equity funds)
  marketCapStyle?: 'Large' | 'Mid' | 'Small' | 'Micro';
  valueGrowthStyle?: 'Deep Value' | 'Value' | 'Blend' | 'Growth' | 'Aggressive Growth';
  
  // Fixed income style
  durationBand?: 'Ultra Short' | 'Short' | 'Intermediate' | 'Long' | 'Extended';
  creditQualityBand?: 'High Quality' | 'Investment Grade' | 'High Yield' | 'Distressed';
  
  // Proprietary classification
  riskBand: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  liquidityBand: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  
  // ESG classification
  esgApproach?: 'Exclusion' | 'Integration' | 'Best-in-Class' | 'Thematic' | 'Impact';
  sfdcClassification?: 'Article 6' | 'Article 8' | 'Article 9';
}

export interface FundBenchmark {
  primaryBenchmark: string;
  primaryBenchmarkTicker: string;
  secondaryBenchmark?: string;
  peerGroup: string;
  peerGroupSize: number;
  peerGroupRank: number;
}

// Morningstar-style proprietary ratings
export interface FundRatings {
  // Star Rating (1-5) - Historical risk-adjusted performance
  starRating?: 1 | 2 | 3 | 4 | 5;
  starRatingDate?: string;
  
  // Analyst Rating - Forward-looking qualitative assessment
  analystRating?: 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';
  analystRatingDate?: string;
  analystRatingRationale?: string;
  
  // Category rating
  categoryRank?: number; // percentile rank in category (1-100)
  
  // Style Box coordinates (1-3 for each dimension)
  styleBoxEquity?: {
    size: 1 | 2 | 3; // 1=Large, 2=Mid, 3=Small
    style: 1 | 2 | 3; // 1=Value, 2=Blend, 3=Growth
  };
  
  styleBoxFixedIncome?: {
    creditQuality: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
    sensitivity: 1 | 2 | 3; // 1=Limited, 2=Moderate, 3=Extensive
  };
  
  // Admin-assigned quality metrics
  peopleRating?: 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';
  processRating?: 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';
  parentRating?: 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';
  performanceRating?: 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';
  priceRating?: 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';
  
  // Last rated by admin
  ratedBy?: string;
  ratedAt?: string;
}

export interface AIInsight {
  type: 'performance' | 'risk' | 'cost' | 'alternative' | 'warning';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  generatedAt: string;
}

export interface CompleteFund extends FundMaster {
  performance: FundPerformance;
  risk: FundRiskMetrics;
  costs: FundCosts;
  exposure: FundExposure;
  classification: FundClassification;
  benchmark: FundBenchmark;
  ratings?: FundRatings; // Morningstar-style proprietary ratings
  aiInsights?: AIInsight[];
  lastUpdated: string;
}

export interface FundComparison {
  funds: CompleteFund[];
  comparisonDate: string;
}

export interface FundSearchFilters {
  searchQuery?: string;
  fundTypes?: string[];
  assetClasses?: string[];
  providers?: string[];
  categories?: string[];
  riskRatingMin?: number;
  riskRatingMax?: number;
  ocfMax?: number;
  aumMin?: number;
  performanceMin1Y?: number;
  ucitsOnly?: boolean;
  accumulatingOnly?: boolean;
  esgOnly?: boolean;
  sortBy?: 'name' | 'performance1Y' | 'performance3Y' | 'ocf' | 'aum' | 'risk';
  sortOrder?: 'asc' | 'desc';
}
