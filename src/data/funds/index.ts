// Fund Database Index - Aggregates all fund data for UK IFA platform
// IMPORTANT: Only verified, real funds are exported
import { IngestibleFund } from '@/types/fundIngestion';
import { isVerifiedFund } from '@/lib/fundDataIntegrity';
import { ukEquityFunds } from './ukEquityFunds';
import { globalEquityFunds } from './globalEquityFunds';
import { fixedIncomeFunds } from './fixedIncomeFunds';
import { multiAssetFunds } from './multiAssetFunds';
import { propertyFunds } from './propertyFunds';

// Filter to only include verified funds with real ISINs
const filterVerified = (funds: IngestibleFund[]): IngestibleFund[] => 
  funds.filter(f => isVerifiedFund(f.isin));

// Aggregate all standard funds (non-property) - verified only
export const standardFunds: IngestibleFund[] = filterVerified([
  ...ukEquityFunds,
  ...globalEquityFunds,
  ...fixedIncomeFunds,
  ...multiAssetFunds,
]);

// Aggregate all funds including property - verified only
export const allFunds: IngestibleFund[] = [
  ...standardFunds,
  ...filterVerified(propertyFunds),
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
