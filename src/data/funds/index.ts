// Fund Database Index - Aggregates all fund data for UK IFA platform
import { IngestibleFund } from '@/types/fundIngestion';
import { ukEquityFunds } from './ukEquityFunds';
import { globalEquityFunds } from './globalEquityFunds';
import { fixedIncomeFunds } from './fixedIncomeFunds';
import { multiAssetFunds } from './multiAssetFunds';
import { propertyFunds } from './propertyFunds';

// Aggregate all standard funds (non-property)
export const standardFunds: IngestibleFund[] = [
  ...ukEquityFunds,
  ...globalEquityFunds,
  ...fixedIncomeFunds,
  ...multiAssetFunds,
];

// Aggregate all funds including property
export const allFunds: IngestibleFund[] = [
  ...standardFunds,
  ...propertyFunds,
];

// Export individual categories
export { ukEquityFunds } from './ukEquityFunds';
export { globalEquityFunds } from './globalEquityFunds';
export { fixedIncomeFunds } from './fixedIncomeFunds';
export { multiAssetFunds } from './multiAssetFunds';
export { propertyFunds } from './propertyFunds';

// Helper functions
export function getFundByISIN(isin: string): IngestibleFund | undefined {
  return allFunds.find(f => f.isin === isin);
}

export function getFundsByType(fundType: IngestibleFund['fundType']): IngestibleFund[] {
  return allFunds.filter(f => f.fundType === fundType);
}

export function getFundsByCategory(category: 'standard' | 'property'): IngestibleFund[] {
  if (category === 'property') {
    return allFunds.filter(f => f.fundCategory === 'property');
  }
  return allFunds.filter(f => f.fundCategory !== 'property');
}

export function getFundsByManager(managementCompany: string): IngestibleFund[] {
  return allFunds.filter(f => f.managementCompany.toLowerCase().includes(managementCompany.toLowerCase()));
}

export function searchFunds(query: string): IngestibleFund[] {
  const lowerQuery = query.toLowerCase();
  return allFunds.filter(f => 
    f.fundName.toLowerCase().includes(lowerQuery) ||
    f.isin.toLowerCase().includes(lowerQuery) ||
    (f.ticker?.toLowerCase().includes(lowerQuery)) ||
    f.fundManager.toLowerCase().includes(lowerQuery) ||
    f.managementCompany.toLowerCase().includes(lowerQuery)
  );
}

// Database stats
export const fundDatabaseStats = {
  totalFunds: allFunds.length,
  standardFunds: standardFunds.length,
  propertyFunds: propertyFunds.length,
  byType: {
    OEIC: allFunds.filter(f => f.fundType === 'OEIC').length,
    ETF: allFunds.filter(f => f.fundType === 'ETF').length,
    'Unit Trust': allFunds.filter(f => f.fundType === 'Unit Trust').length,
    SICAV: allFunds.filter(f => f.fundType === 'SICAV').length,
    'Investment Trust': allFunds.filter(f => f.fundType === 'Investment Trust').length,
  },
  byShareClass: {
    Accumulating: allFunds.filter(f => f.shareClass === 'Accumulating').length,
    Income: allFunds.filter(f => f.shareClass === 'Income').length,
  },
  providers: [...new Set(allFunds.map(f => f.managementCompany))],
  lastUpdated: new Date().toISOString()
};
