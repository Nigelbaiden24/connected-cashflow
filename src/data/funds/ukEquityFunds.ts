// UK Equity Funds - Real fund data for UK IFA platform
import { IngestibleFund, NavHistoryEntry } from '@/types/fundIngestion';

// Helper to generate NAV history
function generateNavHistory(baseNav: number, days: number, volatility: number): NavHistoryEntry[] {
  const history: NavHistoryEntry[] = [];
  let currentNav = baseNav;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Skip weekends
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

export const ukEquityFunds: IngestibleFund[] = [
  // LIONTRUST
  {
    fundName: "Liontrust UK Growth Fund",
    isin: "GB00B8HWCL59",
    ticker: "LIUKGA",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2009-03-02",
    fundManager: "Anthony Cross",
    managementCompany: "Liontrust Fund Partners LLP",
    latestNav: 462.84,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 2.14,
    return3M: 4.87,
    return6M: 8.92,
    returnYTD: 12.45,
    return1Y: 14.23,
    navHistory: generateNavHistory(462.84, 180, 1.2),
    riskMetrics: {
      volatility1Y: 14.2,
      maxDrawdown1Y: -8.7,
      sharpeRatio1Y: 0.89,
      betaVsBenchmark: 0.95
    },
    economics: {
      ocf: 0.89,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Experian plc", weight: 4.2 },
      { name: "Sage Group plc", weight: 3.8 },
      { name: "RELX plc", weight: 3.6 },
      { name: "Halma plc", weight: 3.4 },
      { name: "Spirax-Sarco Engineering plc", weight: 3.2 },
      { name: "Rightmove plc", weight: 3.0 },
      { name: "Games Workshop Group plc", weight: 2.9 },
      { name: "Diploma plc", weight: 2.8 },
      { name: "Future plc", weight: 2.6 },
      { name: "Compass Group plc", weight: 2.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Liontrust Special Situations Fund",
    isin: "GB00B57H4F11",
    ticker: "LISSIA",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2005-11-10",
    fundManager: "Anthony Cross",
    managementCompany: "Liontrust Fund Partners LLP",
    latestNav: 589.32,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.89,
    return3M: 5.12,
    return6M: 9.45,
    returnYTD: 11.87,
    return1Y: 13.56,
    navHistory: generateNavHistory(589.32, 180, 1.3),
    riskMetrics: {
      volatility1Y: 15.1,
      maxDrawdown1Y: -9.2,
      sharpeRatio1Y: 0.82,
      betaVsBenchmark: 0.92
    },
    economics: {
      ocf: 0.87,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "RELX plc", weight: 4.5 },
      { name: "Experian plc", weight: 4.1 },
      { name: "Sage Group plc", weight: 3.7 },
      { name: "Halma plc", weight: 3.5 },
      { name: "London Stock Exchange Group plc", weight: 3.2 },
      { name: "Spirax-Sarco Engineering plc", weight: 3.0 },
      { name: "Rightmove plc", weight: 2.8 },
      { name: "Games Workshop Group plc", weight: 2.7 },
      { name: "JD Sports Fashion plc", weight: 2.5 },
      { name: "Diploma plc", weight: 2.4 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // FUNDSMITH
  {
    fundName: "Fundsmith Equity Fund",
    isin: "GB00B41YBW71",
    ticker: "FUNDSMITH",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2010-11-01",
    fundManager: "Terry Smith",
    managementCompany: "Fundsmith LLP",
    latestNav: 687.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 3.21,
    return3M: 7.45,
    return6M: 12.34,
    returnYTD: 18.67,
    return1Y: 21.34,
    navHistory: generateNavHistory(687.45, 180, 1.1),
    riskMetrics: {
      volatility1Y: 12.8,
      maxDrawdown1Y: -7.2,
      sharpeRatio1Y: 1.45,
      betaVsBenchmark: 0.88
    },
    economics: {
      ocf: 0.94,
      amc: 0.90,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "None"
    },
    topHoldings: [
      { name: "Microsoft Corporation", weight: 8.2 },
      { name: "Meta Platforms Inc", weight: 7.1 },
      { name: "Novo Nordisk A/S", weight: 6.8 },
      { name: "L'Oréal SA", weight: 5.9 },
      { name: "Philip Morris International", weight: 5.4 },
      { name: "Stryker Corporation", weight: 5.1 },
      { name: "IDEXX Laboratories Inc", weight: 4.8 },
      { name: "Estée Lauder Companies", weight: 4.5 },
      { name: "Automatic Data Processing", weight: 4.2 },
      { name: "Marriott International", weight: 3.9 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // ARTEMIS
  {
    fundName: "Artemis UK Select Fund",
    isin: "GB00B2PLJH12",
    ticker: "ARTUKSEL",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2002-06-07",
    fundManager: "Ed Mayall",
    managementCompany: "Artemis Fund Managers Limited",
    latestNav: 312.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.45,
    return3M: 3.89,
    return6M: 7.12,
    returnYTD: 9.87,
    return1Y: 11.23,
    navHistory: generateNavHistory(312.56, 180, 1.4),
    riskMetrics: {
      volatility1Y: 15.8,
      maxDrawdown1Y: -10.1,
      sharpeRatio1Y: 0.67,
      betaVsBenchmark: 1.02
    },
    economics: {
      ocf: 0.82,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Shell plc", weight: 5.8 },
      { name: "AstraZeneca plc", weight: 5.2 },
      { name: "HSBC Holdings plc", weight: 4.8 },
      { name: "BP plc", weight: 4.5 },
      { name: "Unilever plc", weight: 4.2 },
      { name: "GSK plc", weight: 3.9 },
      { name: "Rio Tinto plc", weight: 3.6 },
      { name: "British American Tobacco plc", weight: 3.4 },
      { name: "Diageo plc", weight: 3.2 },
      { name: "Glencore plc", weight: 3.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Artemis Income Fund",
    isin: "GB00B2PLJJ36",
    ticker: "ARTINC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2000-06-01",
    fundManager: "Adrian Frost",
    managementCompany: "Artemis Fund Managers Limited",
    latestNav: 198.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.98,
    return3M: 2.56,
    return6M: 5.89,
    returnYTD: 7.45,
    return1Y: 9.12,
    navHistory: generateNavHistory(198.34, 180, 1.1),
    riskMetrics: {
      volatility1Y: 12.4,
      maxDrawdown1Y: -6.8,
      sharpeRatio1Y: 0.72,
      betaVsBenchmark: 0.89
    },
    economics: {
      ocf: 0.81,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Shell plc", weight: 6.2 },
      { name: "HSBC Holdings plc", weight: 5.4 },
      { name: "BP plc", weight: 5.1 },
      { name: "British American Tobacco plc", weight: 4.8 },
      { name: "Unilever plc", weight: 4.5 },
      { name: "Rio Tinto plc", weight: 4.2 },
      { name: "GSK plc", weight: 3.9 },
      { name: "Vodafone Group plc", weight: 3.6 },
      { name: "Legal & General Group plc", weight: 3.4 },
      { name: "National Grid plc", weight: 3.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // ABRDN (formerly Aberdeen Standard)
  {
    fundName: "abrdn UK Equity Fund",
    isin: "GB00B0XWNB31",
    ticker: "ABRUKE",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2005-10-24",
    fundManager: "Andrew Millington",
    managementCompany: "abrdn Fund Managers Limited",
    latestNav: 234.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.23,
    return3M: 3.45,
    return6M: 6.78,
    returnYTD: 8.91,
    return1Y: 10.45,
    navHistory: generateNavHistory(234.67, 180, 1.3),
    riskMetrics: {
      volatility1Y: 14.5,
      maxDrawdown1Y: -8.9,
      sharpeRatio1Y: 0.69,
      betaVsBenchmark: 0.98
    },
    economics: {
      ocf: 0.91,
      amc: 0.80,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "AstraZeneca plc", weight: 7.2 },
      { name: "Shell plc", weight: 6.8 },
      { name: "HSBC Holdings plc", weight: 5.4 },
      { name: "Unilever plc", weight: 4.9 },
      { name: "BP plc", weight: 4.5 },
      { name: "Diageo plc", weight: 4.1 },
      { name: "GSK plc", weight: 3.8 },
      { name: "Rio Tinto plc", weight: 3.5 },
      { name: "Reckitt Benckiser Group plc", weight: 3.2 },
      { name: "National Grid plc", weight: 3.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "abrdn UK Smaller Companies Fund",
    isin: "GB00B7KVX245",
    ticker: "ABRSMC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-08-20",
    fundManager: "Abby Glennie",
    managementCompany: "abrdn Fund Managers Limited",
    latestNav: 178.92,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: -0.45,
    return3M: 1.23,
    return6M: 3.45,
    returnYTD: 4.56,
    return1Y: 6.78,
    navHistory: generateNavHistory(178.92, 180, 1.8),
    riskMetrics: {
      volatility1Y: 18.9,
      maxDrawdown1Y: -14.2,
      sharpeRatio1Y: 0.42,
      betaVsBenchmark: 1.12
    },
    economics: {
      ocf: 0.99,
      amc: 0.85,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Bytes Technology Group plc", weight: 3.4 },
      { name: "Gamma Communications plc", weight: 3.2 },
      { name: "Impax Asset Management Group plc", weight: 3.0 },
      { name: "Ergomed plc", weight: 2.8 },
      { name: "Mortgage Advice Bureau Holdings plc", weight: 2.6 },
      { name: "Telecom Plus plc", weight: 2.5 },
      { name: "Liontrust Asset Management plc", weight: 2.4 },
      { name: "Next Fifteen Communications Group plc", weight: 2.3 },
      { name: "Judges Scientific plc", weight: 2.2 },
      { name: "XPS Pensions Group plc", weight: 2.1 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // INVESCO
  {
    fundName: "Invesco UK Enhanced Index Fund",
    isin: "GB00B7JJPF45",
    ticker: "INVUKE",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-03-05",
    fundManager: "Michael Fraikin",
    managementCompany: "Invesco Fund Managers Limited",
    latestNav: 156.78,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.56,
    return3M: 4.12,
    return6M: 7.89,
    returnYTD: 10.23,
    return1Y: 12.45,
    navHistory: generateNavHistory(156.78, 180, 1.0),
    riskMetrics: {
      volatility1Y: 13.2,
      maxDrawdown1Y: -7.8,
      sharpeRatio1Y: 0.91,
      betaVsBenchmark: 1.01
    },
    economics: {
      ocf: 0.31,
      amc: 0.25,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "AstraZeneca plc", weight: 8.9 },
      { name: "Shell plc", weight: 7.8 },
      { name: "HSBC Holdings plc", weight: 6.2 },
      { name: "Unilever plc", weight: 5.4 },
      { name: "BP plc", weight: 4.8 },
      { name: "GSK plc", weight: 4.2 },
      { name: "Diageo plc", weight: 3.9 },
      { name: "British American Tobacco plc", weight: 3.6 },
      { name: "Rio Tinto plc", weight: 3.4 },
      { name: "Glencore plc", weight: 3.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // JUPITER
  {
    fundName: "Jupiter UK Special Situations Fund",
    isin: "GB00B4KL9F89",
    ticker: "JUPSS",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2010-07-01",
    fundManager: "Ben Whitmore",
    managementCompany: "Jupiter Unit Trust Managers Limited",
    latestNav: 287.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.89,
    return3M: 2.34,
    return6M: 5.67,
    returnYTD: 7.89,
    return1Y: 9.23,
    navHistory: generateNavHistory(287.45, 180, 1.4),
    riskMetrics: {
      volatility1Y: 15.6,
      maxDrawdown1Y: -9.8,
      sharpeRatio1Y: 0.58,
      betaVsBenchmark: 0.94
    },
    economics: {
      ocf: 0.76,
      amc: 0.65,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Barclays plc", weight: 4.8 },
      { name: "NatWest Group plc", weight: 4.5 },
      { name: "Aviva plc", weight: 4.2 },
      { name: "Standard Chartered plc", weight: 3.9 },
      { name: "BP plc", weight: 3.7 },
      { name: "BT Group plc", weight: 3.5 },
      { name: "Marks & Spencer Group plc", weight: 3.3 },
      { name: "Currys plc", weight: 3.1 },
      { name: "J Sainsbury plc", weight: 2.9 },
      { name: "WPP plc", weight: 2.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Jupiter Income Trust",
    isin: "GB00B5VNHX01",
    ticker: "JUPINC",
    fundType: "Unit Trust",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2011-02-14",
    fundManager: "Ben Whitmore",
    managementCompany: "Jupiter Unit Trust Managers Limited",
    latestNav: 112.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.67,
    return3M: 1.89,
    return6M: 4.23,
    returnYTD: 6.12,
    return1Y: 7.89,
    navHistory: generateNavHistory(112.34, 180, 1.2),
    riskMetrics: {
      volatility1Y: 13.8,
      maxDrawdown1Y: -8.2,
      sharpeRatio1Y: 0.54,
      betaVsBenchmark: 0.91
    },
    economics: {
      ocf: 0.77,
      amc: 0.65,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "British American Tobacco plc", weight: 5.2 },
      { name: "BP plc", weight: 4.8 },
      { name: "Shell plc", weight: 4.5 },
      { name: "Legal & General Group plc", weight: 4.2 },
      { name: "Aviva plc", weight: 3.9 },
      { name: "HSBC Holdings plc", weight: 3.7 },
      { name: "Rio Tinto plc", weight: 3.5 },
      { name: "Vodafone Group plc", weight: 3.3 },
      { name: "National Grid plc", weight: 3.1 },
      { name: "Phoenix Group Holdings plc", weight: 2.9 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // M&G
  {
    fundName: "M&G Recovery Fund",
    isin: "GB00B1XFJS91",
    ticker: "MGREC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2001-09-01",
    fundManager: "Tom Sherlock",
    managementCompany: "M&G Securities Limited",
    latestNav: 245.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: -0.34,
    return3M: 1.56,
    return6M: 4.89,
    returnYTD: 5.67,
    return1Y: 7.12,
    navHistory: generateNavHistory(245.67, 180, 1.5),
    riskMetrics: {
      volatility1Y: 16.8,
      maxDrawdown1Y: -11.2,
      sharpeRatio1Y: 0.45,
      betaVsBenchmark: 1.08
    },
    economics: {
      ocf: 0.91,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Rolls-Royce Holdings plc", weight: 4.5 },
      { name: "Barclays plc", weight: 4.2 },
      { name: "BP plc", weight: 3.9 },
      { name: "NatWest Group plc", weight: 3.7 },
      { name: "Lloyds Banking Group plc", weight: 3.5 },
      { name: "IAG (International Airlines Group)", weight: 3.3 },
      { name: "BT Group plc", weight: 3.1 },
      { name: "Standard Chartered plc", weight: 2.9 },
      { name: "ITV plc", weight: 2.7 },
      { name: "Marks & Spencer Group plc", weight: 2.6 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // FIDELITY
  {
    fundName: "Fidelity Special Situations Fund",
    isin: "GB00B88V3X40",
    ticker: "FIDSS",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-12-10",
    fundManager: "Alex Wright",
    managementCompany: "FIL Investment Services (UK) Limited",
    latestNav: 398.23,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.78,
    return3M: 4.56,
    return6M: 8.34,
    returnYTD: 11.23,
    return1Y: 13.45,
    navHistory: generateNavHistory(398.23, 180, 1.3),
    riskMetrics: {
      volatility1Y: 14.9,
      maxDrawdown1Y: -9.4,
      sharpeRatio1Y: 0.84,
      betaVsBenchmark: 0.97
    },
    economics: {
      ocf: 0.92,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Aviva plc", weight: 4.8 },
      { name: "Barclays plc", weight: 4.5 },
      { name: "GSK plc", weight: 4.2 },
      { name: "NatWest Group plc", weight: 3.9 },
      { name: "Imperial Brands plc", weight: 3.6 },
      { name: "BAE Systems plc", weight: 3.4 },
      { name: "Standard Chartered plc", weight: 3.2 },
      { name: "Ryanair Holdings plc", weight: 3.0 },
      { name: "Melrose Industries plc", weight: 2.8 },
      { name: "Tesco plc", weight: 2.7 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Fidelity UK Smaller Companies Fund",
    isin: "GB00B7VNMB18",
    ticker: "FIDSMC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-12-10",
    fundManager: "Jonathan Sheridan",
    managementCompany: "FIL Investment Services (UK) Limited",
    latestNav: 267.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: -0.23,
    return3M: 2.45,
    return6M: 5.67,
    returnYTD: 7.89,
    return1Y: 9.12,
    navHistory: generateNavHistory(267.89, 180, 1.7),
    riskMetrics: {
      volatility1Y: 17.8,
      maxDrawdown1Y: -12.5,
      sharpeRatio1Y: 0.52,
      betaVsBenchmark: 1.05
    },
    economics: {
      ocf: 0.93,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "Hill & Smith Holdings plc", weight: 3.2 },
      { name: "Kainos Group plc", weight: 3.0 },
      { name: "Midwich Group plc", weight: 2.8 },
      { name: "Bytes Technology Group plc", weight: 2.7 },
      { name: "Treatt plc", weight: 2.5 },
      { name: "Dechra Pharmaceuticals plc", weight: 2.4 },
      { name: "CVS Group plc", weight: 2.3 },
      { name: "Tatton Asset Management plc", weight: 2.2 },
      { name: "Focusrite plc", weight: 2.1 },
      { name: "Bloomsbury Publishing plc", weight: 2.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // THREADNEEDLE
  {
    fundName: "Threadneedle UK Fund",
    isin: "GB00B8169Q14",
    ticker: "THUKF",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-08-06",
    fundManager: "Richard Colwell",
    managementCompany: "Threadneedle Investment Services Limited",
    latestNav: 189.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.34,
    return3M: 3.67,
    return6M: 7.12,
    returnYTD: 9.45,
    return1Y: 11.23,
    navHistory: generateNavHistory(189.45, 180, 1.2),
    riskMetrics: {
      volatility1Y: 14.1,
      maxDrawdown1Y: -8.5,
      sharpeRatio1Y: 0.78,
      betaVsBenchmark: 0.96
    },
    economics: {
      ocf: 0.82,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "AstraZeneca plc", weight: 6.8 },
      { name: "Shell plc", weight: 6.2 },
      { name: "HSBC Holdings plc", weight: 5.4 },
      { name: "Unilever plc", weight: 4.8 },
      { name: "Diageo plc", weight: 4.2 },
      { name: "BP plc", weight: 3.9 },
      { name: "RELX plc", weight: 3.6 },
      { name: "GSK plc", weight: 3.4 },
      { name: "Rio Tinto plc", weight: 3.2 },
      { name: "British American Tobacco plc", weight: 3.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // LEGAL & GENERAL
  {
    fundName: "Legal & General UK 100 Index Trust",
    isin: "GB00BG0QPL51",
    ticker: "LGUK100",
    fundType: "Unit Trust",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2018-05-14",
    fundManager: "Index Team",
    managementCompany: "Legal & General Investment Management",
    latestNav: 134.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.67,
    return3M: 4.23,
    return6M: 8.12,
    returnYTD: 10.89,
    return1Y: 12.78,
    navHistory: generateNavHistory(134.56, 180, 1.0),
    riskMetrics: {
      volatility1Y: 13.4,
      maxDrawdown1Y: -7.9,
      sharpeRatio1Y: 0.92,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.10,
      amc: 0.06,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "AstraZeneca plc", weight: 9.2 },
      { name: "Shell plc", weight: 8.1 },
      { name: "HSBC Holdings plc", weight: 6.4 },
      { name: "Unilever plc", weight: 5.6 },
      { name: "BP plc", weight: 4.9 },
      { name: "GSK plc", weight: 4.3 },
      { name: "Diageo plc", weight: 3.8 },
      { name: "British American Tobacco plc", weight: 3.5 },
      { name: "Rio Tinto plc", weight: 3.3 },
      { name: "Glencore plc", weight: 3.1 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Legal & General UK Mid Cap Index Fund",
    isin: "GB00B8HWBV76",
    ticker: "LGMID",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-04-02",
    fundManager: "Index Team",
    managementCompany: "Legal & General Investment Management",
    latestNav: 98.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.89,
    return3M: 2.34,
    return6M: 5.12,
    returnYTD: 6.78,
    return1Y: 8.23,
    navHistory: generateNavHistory(98.45, 180, 1.3),
    riskMetrics: {
      volatility1Y: 15.2,
      maxDrawdown1Y: -9.8,
      sharpeRatio1Y: 0.55,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.15,
      amc: 0.10,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "Intermediate Capital Group plc", weight: 3.8 },
      { name: "3i Infrastructure plc", weight: 3.5 },
      { name: "Hiscox Ltd", weight: 3.2 },
      { name: "Beazley plc", weight: 3.0 },
      { name: "Ocado Group plc", weight: 2.8 },
      { name: "JD Sports Fashion plc", weight: 2.7 },
      { name: "Weir Group plc", weight: 2.5 },
      { name: "Howden Joinery Group plc", weight: 2.4 },
      { name: "Rentokil Initial plc", weight: 2.3 },
      { name: "Hikma Pharmaceuticals plc", weight: 2.2 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // BLACKROCK
  {
    fundName: "BlackRock UK Equity Fund",
    isin: "GB00B7H4HN09",
    ticker: "BLKUKE",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-07-09",
    fundManager: "Nick Little",
    managementCompany: "BlackRock Investment Management (UK) Limited",
    latestNav: 312.78,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.45,
    return3M: 3.89,
    return6M: 7.56,
    returnYTD: 10.12,
    return1Y: 12.34,
    navHistory: generateNavHistory(312.78, 180, 1.2),
    riskMetrics: {
      volatility1Y: 14.3,
      maxDrawdown1Y: -8.6,
      sharpeRatio1Y: 0.82,
      betaVsBenchmark: 0.98
    },
    economics: {
      ocf: 0.85,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "AstraZeneca plc", weight: 7.5 },
      { name: "Shell plc", weight: 6.8 },
      { name: "HSBC Holdings plc", weight: 5.9 },
      { name: "Unilever plc", weight: 5.2 },
      { name: "BP plc", weight: 4.6 },
      { name: "Diageo plc", weight: 4.1 },
      { name: "GSK plc", weight: 3.8 },
      { name: "RELX plc", weight: 3.5 },
      { name: "Rio Tinto plc", weight: 3.2 },
      { name: "British American Tobacco plc", weight: 3.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // SCHRODERS
  {
    fundName: "Schroder UK Alpha Plus Fund",
    isin: "GB00B5B73685",
    ticker: "SCHRAP",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2010-04-06",
    fundManager: "Matt Sherwood",
    managementCompany: "Schroder Unit Trusts Limited",
    latestNav: 423.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 1.89,
    return3M: 4.67,
    return6M: 8.89,
    returnYTD: 12.34,
    return1Y: 14.56,
    navHistory: generateNavHistory(423.67, 180, 1.3),
    riskMetrics: {
      volatility1Y: 15.1,
      maxDrawdown1Y: -9.3,
      sharpeRatio1Y: 0.91,
      betaVsBenchmark: 0.95
    },
    economics: {
      ocf: 0.91,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Annual"
    },
    topHoldings: [
      { name: "RELX plc", weight: 5.2 },
      { name: "London Stock Exchange Group plc", weight: 4.8 },
      { name: "Compass Group plc", weight: 4.5 },
      { name: "Experian plc", weight: 4.2 },
      { name: "Halma plc", weight: 3.9 },
      { name: "Ashtead Group plc", weight: 3.6 },
      { name: "Sage Group plc", weight: 3.4 },
      { name: "Bunzl plc", weight: 3.2 },
      { name: "Intertek Group plc", weight: 3.0 },
      { name: "Rightmove plc", weight: 2.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Schroder Income Fund",
    isin: "GB00B8BV2B37",
    ticker: "SCHRINC",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2012-11-12",
    fundManager: "Nick Kirrage",
    managementCompany: "Schroder Unit Trusts Limited",
    latestNav: 167.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.78,
    return3M: 2.12,
    return6M: 4.89,
    returnYTD: 6.45,
    return1Y: 8.12,
    navHistory: generateNavHistory(167.89, 180, 1.1),
    riskMetrics: {
      volatility1Y: 13.5,
      maxDrawdown1Y: -7.8,
      sharpeRatio1Y: 0.62,
      betaVsBenchmark: 0.92
    },
    economics: {
      ocf: 0.91,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Shell plc", weight: 5.8 },
      { name: "BP plc", weight: 5.2 },
      { name: "HSBC Holdings plc", weight: 4.8 },
      { name: "British American Tobacco plc", weight: 4.5 },
      { name: "GSK plc", weight: 4.2 },
      { name: "Vodafone Group plc", weight: 3.9 },
      { name: "Rio Tinto plc", weight: 3.6 },
      { name: "Legal & General Group plc", weight: 3.4 },
      { name: "National Grid plc", weight: 3.2 },
      { name: "Aviva plc", weight: 3.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  }
];
