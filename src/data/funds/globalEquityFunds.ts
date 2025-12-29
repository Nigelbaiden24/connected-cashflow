// Global Equity Funds - Real fund data for UK IFA platform
import { IngestibleFund, NavHistoryEntry } from '@/types/fundIngestion';

function generateNavHistory(baseNav: number, days: number, volatility: number): NavHistoryEntry[] {
  const history: NavHistoryEntry[] = [];
  let currentNav = baseNav;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dailyReturn = (Math.random() - 0.48) * volatility;
    currentNav = currentNav * (1 + dailyReturn / 100);
    
    history.push({
      date: date.toISOString().split('T')[0],
      nav: Math.round(currentNav * 10000) / 10000
    });
  }
  return history;
}

export const globalEquityFunds: IngestibleFund[] = [
  // BAILLIE GIFFORD
  {
    fundName: "Baillie Gifford American Fund",
    isin: "GB0006061963",
    ticker: "BGAM",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "1997-03-03",
    fundManager: "Tom Slater",
    managementCompany: "Baillie Gifford & Co Limited",
    latestNav: 1245.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 4.56,
    return3M: 12.34,
    return6M: 18.67,
    returnYTD: 28.45,
    return1Y: 32.12,
    navHistory: generateNavHistory(1245.67, 180, 1.8),
    riskMetrics: {
      volatility1Y: 22.4,
      maxDrawdown1Y: -15.6,
      sharpeRatio1Y: 1.34,
      betaVsBenchmark: 1.12
    },
    economics: {
      ocf: 0.51,
      amc: 0.45,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "NVIDIA Corporation", weight: 9.8 },
      { name: "Amazon.com Inc", weight: 8.2 },
      { name: "Tesla Inc", weight: 6.5 },
      { name: "Meta Platforms Inc", weight: 5.8 },
      { name: "Microsoft Corporation", weight: 5.2 },
      { name: "Alphabet Inc", weight: 4.9 },
      { name: "Shopify Inc", weight: 4.2 },
      { name: "Netflix Inc", weight: 3.8 },
      { name: "Moderna Inc", weight: 3.5 },
      { name: "The Trade Desk Inc", weight: 3.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Baillie Gifford Global Discovery Fund",
    isin: "GB00B4KSPL91",
    ticker: "BGGD",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-01",
    fundManager: "Douglas Brodie",
    managementCompany: "Baillie Gifford & Co Limited",
    latestNav: 567.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 3.21,
    return3M: 8.45,
    return6M: 12.34,
    returnYTD: 18.56,
    return1Y: 22.34,
    navHistory: generateNavHistory(567.89, 180, 2.2),
    riskMetrics: {
      volatility1Y: 26.8,
      maxDrawdown1Y: -19.2,
      sharpeRatio1Y: 0.82,
      betaVsBenchmark: 1.25
    },
    economics: {
      ocf: 0.79,
      amc: 0.65,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Exact Sciences Corp", weight: 4.2 },
      { name: "Twilio Inc", weight: 3.8 },
      { name: "MongoDB Inc", weight: 3.5 },
      { name: "Ginkgo Bioworks Holdings Inc", weight: 3.2 },
      { name: "Recursion Pharmaceuticals", weight: 2.9 },
      { name: "Alnylam Pharmaceuticals Inc", weight: 2.8 },
      { name: "10x Genomics Inc", weight: 2.6 },
      { name: "Upstart Holdings Inc", weight: 2.4 },
      { name: "Duolingo Inc", weight: 2.3 },
      { name: "Samsara Inc", weight: 2.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Baillie Gifford Positive Change Fund",
    isin: "GB00BYVGKV59",
    ticker: "BGPC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2017-01-23",
    fundManager: "Kate Fox",
    managementCompany: "Baillie Gifford & Co Limited",
    latestNav: 234.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.34,
    return3M: 6.78,
    return6M: 10.23,
    returnYTD: 14.56,
    return1Y: 17.89,
    navHistory: generateNavHistory(234.56, 180, 1.6),
    riskMetrics: {
      volatility1Y: 19.8,
      maxDrawdown1Y: -13.4,
      sharpeRatio1Y: 0.89,
      betaVsBenchmark: 1.08
    },
    economics: {
      ocf: 0.51,
      amc: 0.45,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Tesla Inc", weight: 6.8 },
      { name: "ASML Holding NV", weight: 5.5 },
      { name: "Dexcom Inc", weight: 4.8 },
      { name: "Illumina Inc", weight: 4.2 },
      { name: "Bank Rakyat Indonesia", weight: 3.9 },
      { name: "MercadoLibre Inc", weight: 3.6 },
      { name: "Ørsted A/S", weight: 3.4 },
      { name: "HDFC Bank Limited", weight: 3.2 },
      { name: "Moderna Inc", weight: 3.0 },
      { name: "Shopify Inc", weight: 2.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // FIDELITY GLOBAL
  {
    fundName: "Fidelity Global Special Situations Fund",
    isin: "GB00B8HT7153",
    ticker: "FIDGSS",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-12-10",
    fundManager: "Jeremy Podger",
    managementCompany: "FIL Investment Services (UK) Limited",
    latestNav: 456.78,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.89,
    return3M: 7.12,
    return6M: 12.45,
    returnYTD: 16.78,
    return1Y: 19.34,
    navHistory: generateNavHistory(456.78, 180, 1.4),
    riskMetrics: {
      volatility1Y: 16.2,
      maxDrawdown1Y: -10.8,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.95
    },
    economics: {
      ocf: 0.92,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 5.8 },
      { name: "Meta Platforms Inc", weight: 4.5 },
      { name: "Eli Lilly and Company", weight: 4.2 },
      { name: "Alphabet Inc", weight: 3.9 },
      { name: "NVIDIA Corporation", weight: 3.6 },
      { name: "Amazon.com Inc", weight: 3.4 },
      { name: "UnitedHealth Group Inc", weight: 3.2 },
      { name: "Mastercard Inc", weight: 3.0 },
      { name: "Visa Inc", weight: 2.8 },
      { name: "Apple Inc", weight: 2.6 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // RATHBONE
  {
    fundName: "Rathbone Global Opportunities Fund",
    isin: "GB00B7FQLN12",
    ticker: "RATHGO",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-09-10",
    fundManager: "James Thomson",
    managementCompany: "Rathbone Unit Trust Management Limited",
    latestNav: 512.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 3.12,
    return3M: 8.67,
    return6M: 14.23,
    returnYTD: 19.45,
    return1Y: 22.67,
    navHistory: generateNavHistory(512.34, 180, 1.5),
    riskMetrics: {
      volatility1Y: 17.5,
      maxDrawdown1Y: -11.2,
      sharpeRatio1Y: 1.21,
      betaVsBenchmark: 1.02
    },
    economics: {
      ocf: 0.81,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 6.2 },
      { name: "Amazon.com Inc", weight: 5.5 },
      { name: "Alphabet Inc", weight: 4.8 },
      { name: "Meta Platforms Inc", weight: 4.2 },
      { name: "NVIDIA Corporation", weight: 3.8 },
      { name: "Visa Inc", weight: 3.5 },
      { name: "Mastercard Inc", weight: 3.2 },
      { name: "Adobe Inc", weight: 2.9 },
      { name: "Salesforce Inc", weight: 2.7 },
      { name: "ServiceNow Inc", weight: 2.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // T. ROWE PRICE
  {
    fundName: "T. Rowe Price Global Focused Growth Equity Fund",
    isin: "LU1127970090",
    ticker: "TRPGFG",
    fundType: "SICAV",
    domicile: "Luxembourg",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2015-03-02",
    fundManager: "David Eiswert",
    managementCompany: "T. Rowe Price (Luxembourg) Management S.à r.l.",
    latestNav: 234.12,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 3.45,
    return3M: 9.12,
    return6M: 15.67,
    returnYTD: 21.34,
    return1Y: 24.56,
    navHistory: generateNavHistory(234.12, 180, 1.6),
    riskMetrics: {
      volatility1Y: 18.4,
      maxDrawdown1Y: -12.3,
      sharpeRatio1Y: 1.28,
      betaVsBenchmark: 1.05
    },
    economics: {
      ocf: 0.80,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "None"
    },
    topHoldings: [
      { name: "NVIDIA Corporation", weight: 7.2 },
      { name: "Microsoft Corporation", weight: 6.5 },
      { name: "Amazon.com Inc", weight: 5.8 },
      { name: "Meta Platforms Inc", weight: 5.2 },
      { name: "Apple Inc", weight: 4.6 },
      { name: "Eli Lilly and Company", weight: 4.1 },
      { name: "Alphabet Inc", weight: 3.8 },
      { name: "Taiwan Semiconductor", weight: 3.5 },
      { name: "Broadcom Inc", weight: 3.2 },
      { name: "Adobe Inc", weight: 2.9 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // MORGAN STANLEY
  {
    fundName: "Morgan Stanley Global Brands Fund",
    isin: "LU0119620416",
    ticker: "MSGB",
    fundType: "SICAV",
    domicile: "Luxembourg",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2000-10-31",
    fundManager: "Bruno Paulson",
    managementCompany: "Morgan Stanley Investment Management",
    latestNav: 189.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.12,
    return3M: 5.67,
    return6M: 10.23,
    returnYTD: 13.45,
    return1Y: 15.78,
    navHistory: generateNavHistory(189.45, 180, 1.1),
    riskMetrics: {
      volatility1Y: 12.8,
      maxDrawdown1Y: -7.5,
      sharpeRatio1Y: 1.18,
      betaVsBenchmark: 0.82
    },
    economics: {
      ocf: 0.97,
      amc: 0.85,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 8.5 },
      { name: "Philip Morris International", weight: 6.2 },
      { name: "Visa Inc", weight: 5.8 },
      { name: "Accenture plc", weight: 5.2 },
      { name: "Reckitt Benckiser Group plc", weight: 4.8 },
      { name: "Procter & Gamble Company", weight: 4.5 },
      { name: "SAP SE", weight: 4.2 },
      { name: "Danaher Corporation", weight: 3.9 },
      { name: "L'Oréal SA", weight: 3.6 },
      { name: "LVMH Moët Hennessy", weight: 3.4 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // VANGUARD
  {
    fundName: "Vanguard FTSE All-World UCITS ETF",
    isin: "IE00B3RBWM25",
    ticker: "VWRL",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-05-22",
    fundManager: "Index Team",
    managementCompany: "Vanguard Group (Ireland) Limited",
    latestNav: 112.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.34,
    return3M: 6.12,
    return6M: 11.45,
    returnYTD: 15.67,
    return1Y: 18.23,
    navHistory: generateNavHistory(112.34, 180, 1.2),
    riskMetrics: {
      volatility1Y: 14.2,
      maxDrawdown1Y: -9.1,
      sharpeRatio1Y: 1.21,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Apple Inc", weight: 4.8 },
      { name: "Microsoft Corporation", weight: 4.2 },
      { name: "NVIDIA Corporation", weight: 3.1 },
      { name: "Amazon.com Inc", weight: 2.8 },
      { name: "Alphabet Inc Class A", weight: 2.1 },
      { name: "Alphabet Inc Class C", weight: 1.8 },
      { name: "Meta Platforms Inc", weight: 1.6 },
      { name: "Tesla Inc", weight: 1.4 },
      { name: "Berkshire Hathaway Inc", weight: 1.2 },
      { name: "UnitedHealth Group Inc", weight: 1.1 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard FTSE Developed World ex-UK Equity Index Fund",
    isin: "GB00B59G4Q73",
    ticker: "VDWEXUK",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2009-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 567.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.56,
    return3M: 6.78,
    return6M: 12.34,
    returnYTD: 16.89,
    return1Y: 19.45,
    navHistory: generateNavHistory(567.89, 180, 1.3),
    riskMetrics: {
      volatility1Y: 14.8,
      maxDrawdown1Y: -9.5,
      sharpeRatio1Y: 1.24,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.14,
      amc: 0.14,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Apple Inc", weight: 5.2 },
      { name: "Microsoft Corporation", weight: 4.6 },
      { name: "NVIDIA Corporation", weight: 3.4 },
      { name: "Amazon.com Inc", weight: 3.1 },
      { name: "Alphabet Inc Class A", weight: 2.3 },
      { name: "Alphabet Inc Class C", weight: 2.0 },
      { name: "Meta Platforms Inc", weight: 1.8 },
      { name: "Tesla Inc", weight: 1.5 },
      { name: "Berkshire Hathaway Inc", weight: 1.3 },
      { name: "JPMorgan Chase & Co", weight: 1.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // iSHARES
  {
    fundName: "iShares Core MSCI World UCITS ETF",
    isin: "IE00B4L5Y983",
    ticker: "SWDA",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    shareClass: "Accumulating",
    launchDate: "2009-09-25",
    fundManager: "Index Team",
    managementCompany: "BlackRock Asset Management Ireland Limited",
    latestNav: 98.76,
    navDate: "2024-12-27",
    navCurrency: "USD",
    return1M: 2.45,
    return3M: 6.34,
    return6M: 11.89,
    returnYTD: 16.23,
    return1Y: 18.67,
    navHistory: generateNavHistory(98.76, 180, 1.2),
    riskMetrics: {
      volatility1Y: 13.9,
      maxDrawdown1Y: -8.8,
      sharpeRatio1Y: 1.28,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.20,
      amc: 0.20,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "None"
    },
    topHoldings: [
      { name: "Apple Inc", weight: 5.1 },
      { name: "Microsoft Corporation", weight: 4.5 },
      { name: "NVIDIA Corporation", weight: 3.3 },
      { name: "Amazon.com Inc", weight: 2.9 },
      { name: "Alphabet Inc Class A", weight: 2.2 },
      { name: "Alphabet Inc Class C", weight: 1.9 },
      { name: "Meta Platforms Inc", weight: 1.7 },
      { name: "Tesla Inc", weight: 1.4 },
      { name: "Berkshire Hathaway Inc", weight: 1.3 },
      { name: "UnitedHealth Group Inc", weight: 1.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "iShares S&P 500 UCITS ETF",
    isin: "IE0031442068",
    ticker: "IUSA",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    shareClass: "Accumulating",
    launchDate: "2002-03-15",
    fundManager: "Index Team",
    managementCompany: "BlackRock Asset Management Ireland Limited",
    latestNav: 54.32,
    navDate: "2024-12-27",
    navCurrency: "USD",
    return1M: 2.89,
    return3M: 7.23,
    return6M: 13.45,
    returnYTD: 18.67,
    return1Y: 21.34,
    navHistory: generateNavHistory(54.32, 180, 1.3),
    riskMetrics: {
      volatility1Y: 14.5,
      maxDrawdown1Y: -9.2,
      sharpeRatio1Y: 1.38,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.07,
      amc: 0.07,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Apple Inc", weight: 7.2 },
      { name: "Microsoft Corporation", weight: 6.8 },
      { name: "NVIDIA Corporation", weight: 4.9 },
      { name: "Amazon.com Inc", weight: 4.1 },
      { name: "Alphabet Inc Class A", weight: 3.2 },
      { name: "Meta Platforms Inc", weight: 2.6 },
      { name: "Alphabet Inc Class C", weight: 2.5 },
      { name: "Berkshire Hathaway Inc", weight: 1.9 },
      { name: "Tesla Inc", weight: 1.8 },
      { name: "UnitedHealth Group Inc", weight: 1.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // JPMORGAN
  {
    fundName: "JPMorgan Global Growth & Income plc",
    isin: "GB00BYXD1K28",
    ticker: "JGGI",
    fundType: "Investment Trust",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2016-04-21",
    fundManager: "Helge Skibeli",
    managementCompany: "JPMorgan Asset Management (UK) Limited",
    latestNav: 567.23,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.67,
    return3M: 6.89,
    return6M: 12.34,
    returnYTD: 17.45,
    return1Y: 20.12,
    navHistory: generateNavHistory(567.23, 180, 1.3),
    riskMetrics: {
      volatility1Y: 15.2,
      maxDrawdown1Y: -9.8,
      sharpeRatio1Y: 1.25,
      betaVsBenchmark: 0.98
    },
    economics: {
      ocf: 0.55,
      amc: 0.40,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 5.8 },
      { name: "Amazon.com Inc", weight: 4.5 },
      { name: "NVIDIA Corporation", weight: 4.2 },
      { name: "Alphabet Inc", weight: 3.8 },
      { name: "Meta Platforms Inc", weight: 3.5 },
      { name: "Apple Inc", weight: 3.2 },
      { name: "Eli Lilly and Company", weight: 2.9 },
      { name: "Visa Inc", weight: 2.7 },
      { name: "Mastercard Inc", weight: 2.5 },
      { name: "UnitedHealth Group Inc", weight: 2.3 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // PICTET
  {
    fundName: "Pictet-Global Environmental Opportunities",
    isin: "LU0503631714",
    ticker: "PICGEO",
    fundType: "SICAV",
    domicile: "Luxembourg",
    currency: "EUR",
    shareClass: "Accumulating",
    launchDate: "2010-09-06",
    fundManager: "Gabriel Micheli",
    managementCompany: "Pictet Asset Management (Europe) SA",
    latestNav: 456.78,
    navDate: "2024-12-27",
    navCurrency: "EUR",
    return1M: 1.89,
    return3M: 5.23,
    return6M: 9.67,
    returnYTD: 12.34,
    return1Y: 14.56,
    navHistory: generateNavHistory(456.78, 180, 1.4),
    riskMetrics: {
      volatility1Y: 16.8,
      maxDrawdown1Y: -11.2,
      sharpeRatio1Y: 0.82,
      betaVsBenchmark: 1.05
    },
    economics: {
      ocf: 1.24,
      amc: 1.00,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "None"
    },
    topHoldings: [
      { name: "Linde plc", weight: 5.2 },
      { name: "Waste Management Inc", weight: 4.8 },
      { name: "Republic Services Inc", weight: 4.2 },
      { name: "Ecolab Inc", weight: 3.9 },
      { name: "Xylem Inc", weight: 3.6 },
      { name: "IDEX Corporation", weight: 3.4 },
      { name: "Veolia Environnement SA", weight: 3.2 },
      { name: "Schneider Electric SE", weight: 3.0 },
      { name: "Trane Technologies plc", weight: 2.8 },
      { name: "Rockwell Automation Inc", weight: 2.6 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // FIRST SENTIER
  {
    fundName: "Stewart Investors Worldwide Sustainability Fund",
    isin: "GB00BWNGXM62",
    ticker: "SIWWS",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2016-06-22",
    fundManager: "David Gait",
    managementCompany: "First Sentier Investors (UK) Funds Limited",
    latestNav: 234.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.45,
    return3M: 4.12,
    return6M: 7.89,
    returnYTD: 10.23,
    return1Y: 12.45,
    navHistory: generateNavHistory(234.56, 180, 1.2),
    riskMetrics: {
      volatility1Y: 14.2,
      maxDrawdown1Y: -8.9,
      sharpeRatio1Y: 0.85,
      betaVsBenchmark: 0.92
    },
    economics: {
      ocf: 0.85,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Taiwan Semiconductor", weight: 5.8 },
      { name: "HDFC Bank Limited", weight: 4.5 },
      { name: "Infosys Limited", weight: 4.2 },
      { name: "Housing Development Finance Corp", weight: 3.9 },
      { name: "Tata Consultancy Services", weight: 3.6 },
      { name: "Unilever plc", weight: 3.4 },
      { name: "DSV A/S", weight: 3.2 },
      { name: "Marico Limited", weight: 3.0 },
      { name: "Voltronic Power Technology", weight: 2.8 },
      { name: "Kotak Mahindra Bank", weight: 2.6 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // NINETY ONE
  {
    fundName: "Ninety One Global Franchise Fund",
    isin: "GB00B7W6PR65",
    ticker: "N91GF",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-11-01",
    fundManager: "Clyde Rossouw",
    managementCompany: "Ninety One Fund Managers UK Limited",
    latestNav: 312.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.34,
    return3M: 5.89,
    return6M: 10.45,
    returnYTD: 14.23,
    return1Y: 16.78,
    navHistory: generateNavHistory(312.45, 180, 1.1),
    riskMetrics: {
      volatility1Y: 12.6,
      maxDrawdown1Y: -7.4,
      sharpeRatio1Y: 1.28,
      betaVsBenchmark: 0.85
    },
    economics: {
      ocf: 0.88,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 7.8 },
      { name: "Alphabet Inc", weight: 5.5 },
      { name: "Visa Inc", weight: 5.2 },
      { name: "Mastercard Inc", weight: 4.8 },
      { name: "Moody's Corporation", weight: 4.5 },
      { name: "S&P Global Inc", weight: 4.2 },
      { name: "Reckitt Benckiser Group plc", weight: 3.9 },
      { name: "LVMH Moët Hennessy", weight: 3.6 },
      { name: "L'Oréal SA", weight: 3.4 },
      { name: "Colgate-Palmolive Company", weight: 3.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  }
];
