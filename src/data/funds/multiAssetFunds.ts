// Multi-Asset Funds - Real fund data for UK IFA platform
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

export const multiAssetFunds: IngestibleFund[] = [
  // VANGUARD LIFESTRATEGY
  {
    fundName: "Vanguard LifeStrategy 20% Equity Fund",
    isin: "GB00B4NXY349",
    ticker: "VLS20",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 178.23,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.34,
    return3M: 1.23,
    return6M: 2.89,
    returnYTD: 4.12,
    return1Y: 5.45,
    navHistory: generateNavHistory(178.23, 180, 0.4),
    riskMetrics: {
      volatility1Y: 4.8,
      maxDrawdown1Y: -2.6,
      sharpeRatio1Y: 1.05,
      betaVsBenchmark: 0.25
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Vanguard UK Investment Grade Bond Index Fund", weight: 25.5 },
      { name: "Vanguard Global Bond Index Fund", weight: 22.8 },
      { name: "Vanguard UK Gilt UCITS ETF", weight: 18.2 },
      { name: "Vanguard UK Inflation-Linked Gilt Index Fund", weight: 15.5 },
      { name: "Vanguard FTSE Developed World ex-UK Equity Index", weight: 8.2 },
      { name: "Vanguard FTSE UK All Share Index Unit Trust", weight: 4.5 },
      { name: "Vanguard FTSE Developed Europe ex-UK Equity", weight: 2.8 },
      { name: "Vanguard Emerging Markets Stock Index", weight: 1.5 },
      { name: "Vanguard Japan Stock Index Fund", weight: 0.8 },
      { name: "Cash", weight: 0.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard LifeStrategy 40% Equity Fund",
    isin: "GB00B3ZHN960",
    ticker: "VLS40",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 234.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.67,
    return3M: 2.12,
    return6M: 4.56,
    returnYTD: 6.78,
    return1Y: 8.34,
    navHistory: generateNavHistory(234.56, 180, 0.6),
    riskMetrics: {
      volatility1Y: 6.8,
      maxDrawdown1Y: -4.2,
      sharpeRatio1Y: 1.15,
      betaVsBenchmark: 0.45
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Vanguard FTSE Developed World ex-UK Equity Index", weight: 18.5 },
      { name: "Vanguard UK Investment Grade Bond Index Fund", weight: 16.2 },
      { name: "Vanguard Global Bond Index Fund", weight: 14.8 },
      { name: "Vanguard UK Gilt UCITS ETF", weight: 12.5 },
      { name: "Vanguard UK Inflation-Linked Gilt Index Fund", weight: 10.2 },
      { name: "Vanguard FTSE UK All Share Index Unit Trust", weight: 9.8 },
      { name: "Vanguard FTSE Developed Europe ex-UK Equity", weight: 6.2 },
      { name: "Vanguard Emerging Markets Stock Index", weight: 5.5 },
      { name: "Vanguard Japan Stock Index Fund", weight: 3.8 },
      { name: "Vanguard Pacific ex-Japan Stock Index Fund", weight: 2.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard LifeStrategy 60% Equity Fund",
    isin: "GB00B3TYHH97",
    ticker: "VLS60",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 312.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.12,
    return3M: 3.45,
    return6M: 7.23,
    returnYTD: 10.12,
    return1Y: 12.34,
    navHistory: generateNavHistory(312.45, 180, 0.9),
    riskMetrics: {
      volatility1Y: 9.2,
      maxDrawdown1Y: -6.1,
      sharpeRatio1Y: 1.25,
      betaVsBenchmark: 0.65
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Vanguard FTSE Developed World ex-UK Equity Index", weight: 28.5 },
      { name: "Vanguard FTSE UK All Share Index Unit Trust", weight: 14.8 },
      { name: "Vanguard UK Investment Grade Bond Index Fund", weight: 10.2 },
      { name: "Vanguard Global Bond Index Fund", weight: 9.5 },
      { name: "Vanguard FTSE Developed Europe ex-UK Equity", weight: 8.2 },
      { name: "Vanguard Emerging Markets Stock Index", weight: 7.8 },
      { name: "Vanguard UK Gilt UCITS ETF", weight: 6.5 },
      { name: "Vanguard UK Inflation-Linked Gilt Index Fund", weight: 5.8 },
      { name: "Vanguard Japan Stock Index Fund", weight: 4.5 },
      { name: "Vanguard Pacific ex-Japan Stock Index Fund", weight: 4.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard LifeStrategy 80% Equity Fund",
    isin: "GB00B4PQW151",
    ticker: "VLS80",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 398.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.56,
    return3M: 4.78,
    return6M: 9.89,
    returnYTD: 13.45,
    return1Y: 16.12,
    navHistory: generateNavHistory(398.67, 180, 1.1),
    riskMetrics: {
      volatility1Y: 11.5,
      maxDrawdown1Y: -7.8,
      sharpeRatio1Y: 1.32,
      betaVsBenchmark: 0.82
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Vanguard FTSE Developed World ex-UK Equity Index", weight: 38.5 },
      { name: "Vanguard FTSE UK All Share Index Unit Trust", weight: 18.8 },
      { name: "Vanguard FTSE Developed Europe ex-UK Equity", weight: 10.2 },
      { name: "Vanguard Emerging Markets Stock Index", weight: 9.5 },
      { name: "Vanguard Japan Stock Index Fund", weight: 5.8 },
      { name: "Vanguard UK Investment Grade Bond Index Fund", weight: 5.2 },
      { name: "Vanguard Global Bond Index Fund", weight: 4.5 },
      { name: "Vanguard Pacific ex-Japan Stock Index Fund", weight: 4.2 },
      { name: "Vanguard UK Gilt UCITS ETF", weight: 2.2 },
      { name: "Vanguard UK Inflation-Linked Gilt Index Fund", weight: 1.1 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard LifeStrategy 100% Equity Fund",
    isin: "GB00B41XG308",
    ticker: "VLS100",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2011-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 478.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.12,
    return3M: 5.89,
    return6M: 11.45,
    returnYTD: 16.78,
    return1Y: 19.34,
    navHistory: generateNavHistory(478.34, 180, 1.3),
    riskMetrics: {
      volatility1Y: 13.8,
      maxDrawdown1Y: -9.5,
      sharpeRatio1Y: 1.35,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.22,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Vanguard FTSE Developed World ex-UK Equity Index", weight: 48.5 },
      { name: "Vanguard FTSE UK All Share Index Unit Trust", weight: 22.8 },
      { name: "Vanguard FTSE Developed Europe ex-UK Equity", weight: 12.2 },
      { name: "Vanguard Emerging Markets Stock Index", weight: 10.5 },
      { name: "Vanguard Japan Stock Index Fund", weight: 5.8 },
      { name: "Vanguard Pacific ex-Japan Stock Index Fund", weight: 5.2 },
      { name: "Cash", weight: 0.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // BLACKROCK MYMAP
  {
    fundName: "BlackRock MyMap 3 Fund",
    isin: "GB00BGHQFK19",
    ticker: "MYMAP3",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2019-03-04",
    fundManager: "Multi-Asset Team",
    managementCompany: "BlackRock Investment Management (UK) Limited",
    latestNav: 112.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.45,
    return3M: 1.56,
    return6M: 3.45,
    returnYTD: 5.12,
    return1Y: 6.78,
    navHistory: generateNavHistory(112.34, 180, 0.5),
    riskMetrics: {
      volatility1Y: 5.8,
      maxDrawdown1Y: -3.4,
      sharpeRatio1Y: 1.08,
      betaVsBenchmark: 0.35
    },
    economics: {
      ocf: 0.17,
      amc: 0.17,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "iShares Core UK Gilts UCITS ETF", weight: 28.5 },
      { name: "iShares Core Global Aggregate Bond UCITS ETF", weight: 22.8 },
      { name: "iShares £ Corporate Bond UCITS ETF", weight: 18.2 },
      { name: "iShares Core MSCI World UCITS ETF", weight: 12.5 },
      { name: "iShares Core FTSE 100 UCITS ETF", weight: 8.5 },
      { name: "iShares Core S&P 500 UCITS ETF", weight: 5.2 },
      { name: "iShares Core MSCI Emerging Markets", weight: 2.8 },
      { name: "Cash", weight: 1.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "BlackRock MyMap 4 Fund",
    isin: "GB00BGHQFN49",
    ticker: "MYMAP4",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2019-03-04",
    fundManager: "Multi-Asset Team",
    managementCompany: "BlackRock Investment Management (UK) Limited",
    latestNav: 123.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.78,
    return3M: 2.34,
    return6M: 5.12,
    returnYTD: 7.45,
    return1Y: 9.23,
    navHistory: generateNavHistory(123.45, 180, 0.7),
    riskMetrics: {
      volatility1Y: 7.8,
      maxDrawdown1Y: -4.8,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.50
    },
    economics: {
      ocf: 0.17,
      amc: 0.17,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "iShares Core MSCI World UCITS ETF", weight: 22.5 },
      { name: "iShares Core UK Gilts UCITS ETF", weight: 18.8 },
      { name: "iShares Core Global Aggregate Bond UCITS ETF", weight: 16.2 },
      { name: "iShares £ Corporate Bond UCITS ETF", weight: 12.5 },
      { name: "iShares Core FTSE 100 UCITS ETF", weight: 10.5 },
      { name: "iShares Core S&P 500 UCITS ETF", weight: 8.2 },
      { name: "iShares Core MSCI Emerging Markets", weight: 5.8 },
      { name: "iShares Core MSCI Europe ex-UK", weight: 4.5 },
      { name: "Cash", weight: 1.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "BlackRock MyMap 5 Fund",
    isin: "GB00BGHQFQ79",
    ticker: "MYMAP5",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2019-03-04",
    fundManager: "Multi-Asset Team",
    managementCompany: "BlackRock Investment Management (UK) Limited",
    latestNav: 134.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.12,
    return3M: 3.45,
    return6M: 7.23,
    returnYTD: 10.56,
    return1Y: 12.89,
    navHistory: generateNavHistory(134.56, 180, 0.9),
    riskMetrics: {
      volatility1Y: 9.8,
      maxDrawdown1Y: -6.2,
      sharpeRatio1Y: 1.25,
      betaVsBenchmark: 0.65
    },
    economics: {
      ocf: 0.17,
      amc: 0.17,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "iShares Core MSCI World UCITS ETF", weight: 32.5 },
      { name: "iShares Core FTSE 100 UCITS ETF", weight: 15.8 },
      { name: "iShares Core S&P 500 UCITS ETF", weight: 12.2 },
      { name: "iShares Core UK Gilts UCITS ETF", weight: 10.5 },
      { name: "iShares Core Global Aggregate Bond UCITS ETF", weight: 8.8 },
      { name: "iShares Core MSCI Emerging Markets", weight: 8.2 },
      { name: "iShares £ Corporate Bond UCITS ETF", weight: 6.5 },
      { name: "iShares Core MSCI Europe ex-UK", weight: 4.5 },
      { name: "Cash", weight: 1.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // LEGAL & GENERAL MULTI-INDEX
  {
    fundName: "Legal & General Multi-Index 3 Fund",
    isin: "GB00B9C03R57",
    ticker: "LGMI3",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-05-07",
    fundManager: "Justin Sheridan",
    managementCompany: "Legal & General Investment Management",
    latestNav: 78.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.34,
    return3M: 1.12,
    return6M: 2.67,
    returnYTD: 4.12,
    return1Y: 5.45,
    navHistory: generateNavHistory(78.34, 180, 0.4),
    riskMetrics: {
      volatility1Y: 4.5,
      maxDrawdown1Y: -2.4,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.30
    },
    economics: {
      ocf: 0.24,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "L&G All Stocks Gilt Index Trust", weight: 25.5 },
      { name: "L&G Global Inflation Linked Bond Index Fund", weight: 20.8 },
      { name: "L&G Sterling Corporate Bond Index Fund", weight: 18.2 },
      { name: "L&G UK 100 Index Trust", weight: 10.5 },
      { name: "L&G International Index Trust", weight: 8.5 },
      { name: "L&G US Index Trust", weight: 6.2 },
      { name: "L&G European Index Trust", weight: 4.8 },
      { name: "L&G Global Emerging Markets Index Fund", weight: 3.5 },
      { name: "L&G Japan Index Trust", weight: 1.5 },
      { name: "Cash", weight: 0.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Legal & General Multi-Index 4 Fund",
    isin: "GB00B9C03X14",
    ticker: "LGMI4",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-05-07",
    fundManager: "Justin Sheridan",
    managementCompany: "Legal & General Investment Management",
    latestNav: 89.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.56,
    return3M: 1.78,
    return6M: 4.12,
    returnYTD: 6.34,
    return1Y: 8.12,
    navHistory: generateNavHistory(89.45, 180, 0.6),
    riskMetrics: {
      volatility1Y: 6.2,
      maxDrawdown1Y: -3.8,
      sharpeRatio1Y: 1.22,
      betaVsBenchmark: 0.45
    },
    economics: {
      ocf: 0.24,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "L&G International Index Trust", weight: 18.5 },
      { name: "L&G All Stocks Gilt Index Trust", weight: 16.8 },
      { name: "L&G Sterling Corporate Bond Index Fund", weight: 14.2 },
      { name: "L&G UK 100 Index Trust", weight: 12.5 },
      { name: "L&G US Index Trust", weight: 10.5 },
      { name: "L&G Global Inflation Linked Bond Index Fund", weight: 10.2 },
      { name: "L&G European Index Trust", weight: 6.8 },
      { name: "L&G Global Emerging Markets Index Fund", weight: 5.5 },
      { name: "L&G Japan Index Trust", weight: 3.5 },
      { name: "L&G Pacific Index Trust", weight: 1.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Legal & General Multi-Index 5 Fund",
    isin: "GB00B9C04088",
    ticker: "LGMI5",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-05-07",
    fundManager: "Justin Sheridan",
    managementCompany: "Legal & General Investment Management",
    latestNav: 98.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.89,
    return3M: 2.56,
    return6M: 5.89,
    returnYTD: 8.67,
    return1Y: 10.89,
    navHistory: generateNavHistory(98.67, 180, 0.8),
    riskMetrics: {
      volatility1Y: 8.2,
      maxDrawdown1Y: -5.2,
      sharpeRatio1Y: 1.28,
      betaVsBenchmark: 0.60
    },
    economics: {
      ocf: 0.24,
      amc: 0.22,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "L&G International Index Trust", weight: 28.5 },
      { name: "L&G UK 100 Index Trust", weight: 15.8 },
      { name: "L&G US Index Trust", weight: 12.2 },
      { name: "L&G All Stocks Gilt Index Trust", weight: 10.5 },
      { name: "L&G Sterling Corporate Bond Index Fund", weight: 8.8 },
      { name: "L&G European Index Trust", weight: 8.2 },
      { name: "L&G Global Emerging Markets Index Fund", weight: 7.5 },
      { name: "L&G Global Inflation Linked Bond Index Fund", weight: 4.5 },
      { name: "L&G Japan Index Trust", weight: 2.5 },
      { name: "L&G Pacific Index Trust", weight: 1.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // HSBC GLOBAL STRATEGY
  {
    fundName: "HSBC Global Strategy Cautious Portfolio",
    isin: "GB00B6SWHT76",
    ticker: "HSBCGSC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-01-09",
    fundManager: "Joseph Little",
    managementCompany: "HSBC Global Asset Management (UK) Limited",
    latestNav: 145.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.45,
    return3M: 1.34,
    return6M: 3.12,
    returnYTD: 4.67,
    return1Y: 6.12,
    navHistory: generateNavHistory(145.67, 180, 0.5),
    riskMetrics: {
      volatility1Y: 5.5,
      maxDrawdown1Y: -3.2,
      sharpeRatio1Y: 1.05,
      betaVsBenchmark: 0.35
    },
    economics: {
      ocf: 0.17,
      amc: 0.15,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "HSBC Global Government Bond Index Fund", weight: 28.5 },
      { name: "HSBC Sterling Corporate Bond Index Fund", weight: 22.8 },
      { name: "HSBC FTSE All-World Index Fund", weight: 18.2 },
      { name: "HSBC FTSE All Share Index Fund", weight: 12.5 },
      { name: "HSBC American Index Fund", weight: 8.5 },
      { name: "HSBC European Index Fund", weight: 4.2 },
      { name: "HSBC Pacific Index Fund", weight: 2.8 },
      { name: "HSBC Emerging Markets Index Fund", weight: 1.5 },
      { name: "Cash", weight: 1.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "HSBC Global Strategy Balanced Portfolio",
    isin: "GB00B6SWT727",
    ticker: "HSBCGSB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-01-09",
    fundManager: "Joseph Little",
    managementCompany: "HSBC Global Asset Management (UK) Limited",
    latestNav: 167.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.78,
    return3M: 2.34,
    return6M: 5.45,
    returnYTD: 7.89,
    return1Y: 10.12,
    navHistory: generateNavHistory(167.89, 180, 0.7),
    riskMetrics: {
      volatility1Y: 7.8,
      maxDrawdown1Y: -4.8,
      sharpeRatio1Y: 1.22,
      betaVsBenchmark: 0.55
    },
    economics: {
      ocf: 0.17,
      amc: 0.15,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "HSBC FTSE All-World Index Fund", weight: 32.5 },
      { name: "HSBC Global Government Bond Index Fund", weight: 18.8 },
      { name: "HSBC Sterling Corporate Bond Index Fund", weight: 14.2 },
      { name: "HSBC FTSE All Share Index Fund", weight: 12.5 },
      { name: "HSBC American Index Fund", weight: 8.5 },
      { name: "HSBC European Index Fund", weight: 5.2 },
      { name: "HSBC Pacific Index Fund", weight: 3.8 },
      { name: "HSBC Emerging Markets Index Fund", weight: 3.5 },
      { name: "Cash", weight: 1.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "HSBC Global Strategy Dynamic Portfolio",
    isin: "GB00B6SWX413",
    ticker: "HSBCGSD",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-01-09",
    fundManager: "Joseph Little",
    managementCompany: "HSBC Global Asset Management (UK) Limited",
    latestNav: 198.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.23,
    return3M: 3.67,
    return6M: 8.12,
    returnYTD: 11.89,
    return1Y: 14.56,
    navHistory: generateNavHistory(198.45, 180, 1.0),
    riskMetrics: {
      volatility1Y: 10.5,
      maxDrawdown1Y: -6.8,
      sharpeRatio1Y: 1.32,
      betaVsBenchmark: 0.75
    },
    economics: {
      ocf: 0.17,
      amc: 0.15,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "HSBC FTSE All-World Index Fund", weight: 45.5 },
      { name: "HSBC FTSE All Share Index Fund", weight: 15.8 },
      { name: "HSBC American Index Fund", weight: 12.2 },
      { name: "HSBC Global Government Bond Index Fund", weight: 8.5 },
      { name: "HSBC Sterling Corporate Bond Index Fund", weight: 6.8 },
      { name: "HSBC European Index Fund", weight: 4.5 },
      { name: "HSBC Emerging Markets Index Fund", weight: 3.5 },
      { name: "HSBC Pacific Index Fund", weight: 2.2 },
      { name: "Cash", weight: 1.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  }
];
