// Fund Data Ingestion Types - Aligned with UK IFA Platform Requirements
// Strict schema for database ingestion with data quality rules

export interface NavHistoryEntry {
  date: string; // YYYY-MM-DD
  nav: number;
}

export interface FundHoldingSnapshot {
  name: string;
  weight: number; // percentage
}

export interface RiskSnapshot {
  volatility1Y: number | null;
  maxDrawdown1Y: number | null;
  sharpeRatio1Y: number | null;
  betaVsBenchmark: number | null;
}

export interface FundEconomics {
  ocf: number; // Ongoing Charges Figure (mandatory)
  amc: number | null; // Annual Management Charge (if separate)
  entryCharge: number | null;
  exitCharge: number | null;
  distributionFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'None';
}

export interface IngestibleFund {
  // CORE IDENTIFIERS (MANDATORY)
  fundName: string;
  isin: string;
  ticker: string | null;
  fundType: 'OEIC' | 'ETF' | 'Unit Trust' | 'SICAV' | 'Investment Trust';
  domicile: string;
  currency: string;
  shareClass: 'Accumulating' | 'Income';
  launchDate: string; // YYYY-MM-DD
  fundManager: string;
  managementCompany: string;
  
  // BASIC PERFORMANCE (MANDATORY)
  latestNav: number;
  navDate: string; // YYYY-MM-DD
  navCurrency: string;
  return1M: number | null;
  return3M: number | null;
  return6M: number | null;
  returnYTD: number | null;
  return1Y: number | null;
  
  // NAV HISTORY (MANDATORY - min 90 days)
  navHistory: NavHistoryEntry[];
  
  // RISK SNAPSHOTS (OPTIONAL)
  riskMetrics: RiskSnapshot | null;
  
  // FUND ECONOMICS (MANDATORY)
  economics: FundEconomics;
  
  // HOLDINGS SNAPSHOT (OPTIONAL)
  topHoldings: FundHoldingSnapshot[] | null;
  
  // METADATA
  dataSource: string;
  lastUpdated: string; // ISO 8601
  dataQualityFlags: string[];
}

// Data validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate fund data before ingestion
export function validateFund(fund: Partial<IngestibleFund>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Mandatory field checks
  if (!fund.fundName) errors.push('Missing fundName');
  if (!fund.isin || !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(fund.isin)) {
    errors.push('Invalid or missing ISIN format');
  }
  if (!fund.fundType) errors.push('Missing fundType');
  if (!fund.domicile) errors.push('Missing domicile');
  if (!fund.currency) errors.push('Missing currency');
  if (!fund.shareClass) errors.push('Missing shareClass');
  if (!fund.launchDate) errors.push('Missing launchDate');
  if (!fund.fundManager) errors.push('Missing fundManager');
  if (!fund.managementCompany) errors.push('Missing managementCompany');
  
  // Performance checks
  if (fund.latestNav === undefined || fund.latestNav === null) {
    errors.push('Missing latestNav');
  }
  if (!fund.navDate) errors.push('Missing navDate');
  if (!fund.navCurrency) errors.push('Missing navCurrency');
  
  // NAV history check (min 90 days)
  if (!fund.navHistory || fund.navHistory.length < 90) {
    warnings.push('NAV history less than 90 days');
  }
  
  // Economics check
  if (!fund.economics || fund.economics.ocf === undefined) {
    errors.push('Missing OCF in economics');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
