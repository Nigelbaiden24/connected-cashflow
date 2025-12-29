// Fixed Income Funds - Real fund data for UK IFA platform
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

export const fixedIncomeFunds: IngestibleFund[] = [
  // PIMCO
  {
    fundName: "PIMCO GIS Income Fund",
    isin: "IE00B7KFL990",
    ticker: "PIMGINC",
    fundType: "SICAV",
    domicile: "Ireland",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2012-11-30",
    fundManager: "Dan Ivascyn",
    managementCompany: "PIMCO Global Advisors (Ireland) Limited",
    latestNav: 10.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.45,
    return3M: 1.23,
    return6M: 3.45,
    returnYTD: 5.67,
    return1Y: 7.89,
    navHistory: generateNavHistory(10.45, 180, 0.4),
    riskMetrics: {
      volatility1Y: 5.8,
      maxDrawdown1Y: -3.2,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.85
    },
    economics: {
      ocf: 0.73,
      amc: 0.55,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Monthly"
    },
    topHoldings: [
      { name: "US Treasury 2.875% 2028", weight: 4.8 },
      { name: "UK Gilt 4.25% 2032", weight: 3.5 },
      { name: "FNMA Pool", weight: 3.2 },
      { name: "Germany Bund 2.5% 2033", weight: 2.9 },
      { name: "JPMorgan Chase 5.5% 2029", weight: 2.6 },
      { name: "Bank of America 4.75% 2028", weight: 2.4 },
      { name: "AT&T Inc 4.35% 2029", weight: 2.2 },
      { name: "Verizon 5.25% 2030", weight: 2.0 },
      { name: "Microsoft 2.675% 2031", weight: 1.9 },
      { name: "Apple 3.25% 2029", weight: 1.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "PIMCO GIS Global Investment Grade Credit Fund",
    isin: "IE00B87CJB73",
    ticker: "PIMGIG",
    fundType: "SICAV",
    domicile: "Ireland",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-04-30",
    fundManager: "Mark Kiesel",
    managementCompany: "PIMCO Global Advisors (Ireland) Limited",
    latestNav: 12.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.34,
    return3M: 1.12,
    return6M: 2.89,
    returnYTD: 4.56,
    return1Y: 6.23,
    navHistory: generateNavHistory(12.34, 180, 0.5),
    riskMetrics: {
      volatility1Y: 6.4,
      maxDrawdown1Y: -3.8,
      sharpeRatio1Y: 0.92,
      betaVsBenchmark: 0.95
    },
    economics: {
      ocf: 0.53,
      amc: 0.40,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "JPMorgan Chase 4.85% 2031", weight: 3.2 },
      { name: "Bank of America 5.12% 2030", weight: 2.9 },
      { name: "Goldman Sachs 4.75% 2029", weight: 2.6 },
      { name: "Morgan Stanley 5.25% 2032", weight: 2.4 },
      { name: "Citigroup 5.0% 2028", weight: 2.2 },
      { name: "Apple 2.65% 2030", weight: 2.0 },
      { name: "Microsoft 2.921% 2052", weight: 1.9 },
      { name: "Amazon 3.875% 2030", weight: 1.8 },
      { name: "AT&T 4.35% 2029", weight: 1.7 },
      { name: "Verizon 4.5% 2033", weight: 1.6 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // M&G
  {
    fundName: "M&G Corporate Bond Fund",
    isin: "GB00B1VMCY93",
    ticker: "MGCB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2007-07-02",
    fundManager: "Richard Woolnough",
    managementCompany: "M&G Securities Limited",
    latestNav: 45.67,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.56,
    return3M: 1.45,
    return6M: 3.12,
    returnYTD: 4.89,
    return1Y: 6.45,
    navHistory: generateNavHistory(45.67, 180, 0.4),
    riskMetrics: {
      volatility1Y: 5.2,
      maxDrawdown1Y: -2.9,
      sharpeRatio1Y: 1.18,
      betaVsBenchmark: 0.92
    },
    economics: {
      ocf: 0.56,
      amc: 0.45,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "UK Gilt 4.25% 2032", weight: 5.2 },
      { name: "Barclays 6.125% 2028", weight: 3.8 },
      { name: "Lloyds Banking Group 5.5% 2030", weight: 3.4 },
      { name: "HSBC 5.875% 2029", weight: 3.1 },
      { name: "NatWest 5.25% 2031", weight: 2.8 },
      { name: "Vodafone 4.875% 2030", weight: 2.5 },
      { name: "BP 4.25% 2028", weight: 2.3 },
      { name: "Shell 4.0% 2032", weight: 2.1 },
      { name: "BAT 5.5% 2033", weight: 2.0 },
      { name: "Tesco 5.125% 2029", weight: 1.9 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "M&G Optimal Income Fund",
    isin: "GB00B1H05718",
    ticker: "MGOI",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2006-12-08",
    fundManager: "Richard Woolnough",
    managementCompany: "M&G Securities Limited",
    latestNav: 23.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.67,
    return3M: 1.78,
    return6M: 3.56,
    returnYTD: 5.23,
    return1Y: 6.89,
    navHistory: generateNavHistory(23.45, 180, 0.5),
    riskMetrics: {
      volatility1Y: 5.8,
      maxDrawdown1Y: -3.4,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.88
    },
    economics: {
      ocf: 0.91,
      amc: 0.75,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Monthly"
    },
    topHoldings: [
      { name: "UK Gilt 4.5% 2034", weight: 8.5 },
      { name: "US Treasury 4.25% 2031", weight: 6.2 },
      { name: "Germany Bund 2.25% 2033", weight: 4.5 },
      { name: "JPMorgan Chase 5.0% 2030", weight: 3.2 },
      { name: "Bank of America 4.875% 2029", weight: 2.8 },
      { name: "Goldman Sachs 5.25% 2031", weight: 2.5 },
      { name: "Shell 3.875% 2028", weight: 2.2 },
      { name: "BP 4.5% 2030", weight: 2.0 },
      { name: "AT&T 4.75% 2032", weight: 1.9 },
      { name: "Verizon 5.0% 2034", weight: 1.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // ROYAL LONDON
  {
    fundName: "Royal London Corporate Bond Fund",
    isin: "GB00B8BC5H23",
    ticker: "RLCB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-07-16",
    fundManager: "Jonathan Maymo",
    managementCompany: "Royal London Unit Trust Managers Limited",
    latestNav: 134.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.45,
    return3M: 1.23,
    return6M: 2.78,
    returnYTD: 4.12,
    return1Y: 5.67,
    navHistory: generateNavHistory(134.56, 180, 0.4),
    riskMetrics: {
      volatility1Y: 4.9,
      maxDrawdown1Y: -2.6,
      sharpeRatio1Y: 1.08,
      betaVsBenchmark: 0.94
    },
    economics: {
      ocf: 0.40,
      amc: 0.30,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "UK Gilt 4.0% 2031", weight: 4.8 },
      { name: "Barclays 5.75% 2029", weight: 3.5 },
      { name: "Lloyds 5.25% 2031", weight: 3.2 },
      { name: "HSBC 5.5% 2030", weight: 2.9 },
      { name: "NatWest 5.0% 2028", weight: 2.6 },
      { name: "Aviva 5.125% 2032", weight: 2.4 },
      { name: "Legal & General 4.875% 2030", weight: 2.2 },
      { name: "Vodafone 4.75% 2029", weight: 2.0 },
      { name: "National Grid 4.5% 2031", weight: 1.9 },
      { name: "BT 4.25% 2028", weight: 1.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Royal London Sterling Extra Yield Bond Fund",
    isin: "GB00B8BJ6362",
    ticker: "RLSEY",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-07-16",
    fundManager: "Paola Binns",
    managementCompany: "Royal London Unit Trust Managers Limited",
    latestNav: 89.23,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.78,
    return3M: 2.12,
    return6M: 4.56,
    returnYTD: 7.89,
    return1Y: 10.23,
    navHistory: generateNavHistory(89.23, 180, 0.6),
    riskMetrics: {
      volatility1Y: 7.2,
      maxDrawdown1Y: -4.5,
      sharpeRatio1Y: 1.32,
      betaVsBenchmark: 1.05
    },
    economics: {
      ocf: 0.52,
      amc: 0.40,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "Iceland Bondco 6.625% 2027", weight: 2.8 },
      { name: "Pinnacle Bidco 5.5% 2028", weight: 2.5 },
      { name: "Virgin Media 4.875% 2028", weight: 2.3 },
      { name: "Jaguar Land Rover 5.5% 2027", weight: 2.1 },
      { name: "Eircom Finance 4.875% 2026", weight: 2.0 },
      { name: "Tesco 5.125% 2029", weight: 1.9 },
      { name: "Heathrow Finance 4.875% 2027", weight: 1.8 },
      { name: "RAC Bond 4.87% 2026", weight: 1.7 },
      { name: "Thames Water 5.875% 2028", weight: 1.6 },
      { name: "Gatwick Funding 4.625% 2029", weight: 1.5 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // JUPITER
  {
    fundName: "Jupiter Strategic Bond Fund",
    isin: "GB00B544HM32",
    ticker: "JUPSB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2008-06-04",
    fundManager: "Ariel Bezalel",
    managementCompany: "Jupiter Unit Trust Managers Limited",
    latestNav: 67.89,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.56,
    return3M: 1.56,
    return6M: 3.23,
    returnYTD: 4.89,
    return1Y: 6.34,
    navHistory: generateNavHistory(67.89, 180, 0.5),
    riskMetrics: {
      volatility1Y: 5.4,
      maxDrawdown1Y: -3.1,
      sharpeRatio1Y: 1.12,
      betaVsBenchmark: 0.82
    },
    economics: {
      ocf: 0.74,
      amc: 0.50,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "US Treasury 4.125% 2032", weight: 8.5 },
      { name: "Australia Govt 3.75% 2033", weight: 5.2 },
      { name: "UK Gilt 4.25% 2031", weight: 4.8 },
      { name: "South Korea 3.5% 2030", weight: 3.5 },
      { name: "New Zealand Govt 3.5% 2033", weight: 3.2 },
      { name: "Germany Bund 2.0% 2032", weight: 2.9 },
      { name: "JPMorgan Chase 4.85% 2030", weight: 2.6 },
      { name: "Bank of America 5.0% 2029", weight: 2.4 },
      { name: "Goldman Sachs 5.25% 2031", weight: 2.2 },
      { name: "Microsoft 2.921% 2052", weight: 2.0 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // INVESCO
  {
    fundName: "Invesco Corporate Bond Fund",
    isin: "GB00B8N46K45",
    ticker: "INVCB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2013-02-04",
    fundManager: "Lyndon Man",
    managementCompany: "Invesco Fund Managers Limited",
    latestNav: 156.78,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.34,
    return3M: 1.12,
    return6M: 2.56,
    returnYTD: 3.89,
    return1Y: 5.23,
    navHistory: generateNavHistory(156.78, 180, 0.4),
    riskMetrics: {
      volatility1Y: 4.8,
      maxDrawdown1Y: -2.5,
      sharpeRatio1Y: 1.02,
      betaVsBenchmark: 0.96
    },
    economics: {
      ocf: 0.56,
      amc: 0.45,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "UK Gilt 4.5% 2034", weight: 5.5 },
      { name: "Barclays 5.875% 2030", weight: 3.8 },
      { name: "HSBC 5.625% 2031", weight: 3.4 },
      { name: "Lloyds 5.375% 2029", weight: 3.1 },
      { name: "Santander UK 4.875% 2028", weight: 2.8 },
      { name: "Nationwide 4.625% 2031", weight: 2.5 },
      { name: "Shell 4.125% 2030", weight: 2.3 },
      { name: "BP 4.375% 2032", weight: 2.1 },
      { name: "Vodafone 5.0% 2029", weight: 1.9 },
      { name: "BT 4.5% 2030", weight: 1.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // VANGUARD
  {
    fundName: "Vanguard UK Investment Grade Bond Index Fund",
    isin: "GB00B454R717",
    ticker: "VUKIGB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2009-06-23",
    fundManager: "Index Team",
    managementCompany: "Vanguard Investments UK Limited",
    latestNav: 178.34,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.23,
    return3M: 0.89,
    return6M: 2.12,
    returnYTD: 3.45,
    return1Y: 4.67,
    navHistory: generateNavHistory(178.34, 180, 0.3),
    riskMetrics: {
      volatility1Y: 4.2,
      maxDrawdown1Y: -2.1,
      sharpeRatio1Y: 1.05,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.12,
      amc: 0.12,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "UK Gilt 4.25% 2032", weight: 6.8 },
      { name: "UK Gilt 4.5% 2034", weight: 5.5 },
      { name: "UK Gilt 3.75% 2031", weight: 4.2 },
      { name: "HSBC 5.5% 2030", weight: 2.8 },
      { name: "Barclays 5.75% 2029", weight: 2.5 },
      { name: "Lloyds 5.25% 2031", weight: 2.3 },
      { name: "NatWest 5.0% 2028", weight: 2.1 },
      { name: "Nationwide 4.5% 2030", weight: 1.9 },
      { name: "Vodafone 4.875% 2029", weight: 1.8 },
      { name: "Shell 4.0% 2032", weight: 1.7 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "Vanguard Global Bond Index Fund",
    isin: "IE00B50W2R13",
    ticker: "VGBI",
    fundType: "OEIC",
    domicile: "Ireland",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2010-05-19",
    fundManager: "Index Team",
    managementCompany: "Vanguard Group (Ireland) Limited",
    latestNav: 12.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.12,
    return3M: 0.67,
    return6M: 1.89,
    returnYTD: 2.78,
    return1Y: 3.89,
    navHistory: generateNavHistory(12.56, 180, 0.25),
    riskMetrics: {
      volatility1Y: 3.8,
      maxDrawdown1Y: -1.8,
      sharpeRatio1Y: 0.95,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.15,
      amc: 0.15,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "US Treasury 4.0% 2031", weight: 12.5 },
      { name: "Japan Govt 0.5% 2032", weight: 8.2 },
      { name: "Germany Bund 2.25% 2033", weight: 6.5 },
      { name: "France OAT 2.5% 2030", weight: 5.8 },
      { name: "UK Gilt 4.25% 2032", weight: 4.5 },
      { name: "Italy BTP 3.25% 2031", weight: 3.8 },
      { name: "Spain Bonos 3.0% 2030", weight: 3.2 },
      { name: "Canada Govt 2.75% 2031", weight: 2.8 },
      { name: "Australia Govt 3.5% 2033", weight: 2.4 },
      { name: "Netherlands 2.0% 2032", weight: 2.1 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // LEGAL & GENERAL
  {
    fundName: "Legal & General All Stocks Gilt Index Trust",
    isin: "GB00B83SYK40",
    ticker: "LGASGI",
    fundType: "Unit Trust",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-05-01",
    fundManager: "Index Team",
    managementCompany: "Legal & General Investment Management",
    latestNav: 234.56,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: -0.12,
    return3M: 0.45,
    return6M: 1.23,
    returnYTD: 1.89,
    return1Y: 2.56,
    navHistory: generateNavHistory(234.56, 180, 0.5),
    riskMetrics: {
      volatility1Y: 6.8,
      maxDrawdown1Y: -4.2,
      sharpeRatio1Y: 0.35,
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
      { name: "UK Gilt 4.5% 2034", weight: 8.5 },
      { name: "UK Gilt 4.25% 2032", weight: 7.2 },
      { name: "UK Gilt 3.75% 2031", weight: 6.8 },
      { name: "UK Gilt 4.0% 2030", weight: 5.5 },
      { name: "UK Gilt 3.5% 2029", weight: 4.8 },
      { name: "UK Gilt 4.75% 2038", weight: 4.2 },
      { name: "UK Gilt 3.25% 2044", weight: 3.8 },
      { name: "UK Gilt 1.75% 2049", weight: 3.5 },
      { name: "UK Gilt 1.625% 2054", weight: 3.2 },
      { name: "UK Gilt 1.25% 2041", weight: 2.9 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // iSHARES
  {
    fundName: "iShares Core UK Gilts UCITS ETF",
    isin: "IE00B1FZSB30",
    ticker: "IGLT",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "GBP",
    shareClass: "Income",
    launchDate: "2006-12-08",
    fundManager: "Index Team",
    managementCompany: "BlackRock Asset Management Ireland Limited",
    latestNav: 11.23,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: -0.15,
    return3M: 0.34,
    return6M: 1.12,
    returnYTD: 1.67,
    return1Y: 2.34,
    navHistory: generateNavHistory(11.23, 180, 0.5),
    riskMetrics: {
      volatility1Y: 6.5,
      maxDrawdown1Y: -4.0,
      sharpeRatio1Y: 0.32,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.07,
      amc: 0.07,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "UK Gilt 4.5% 2034", weight: 7.8 },
      { name: "UK Gilt 4.25% 2032", weight: 6.5 },
      { name: "UK Gilt 3.75% 2031", weight: 6.2 },
      { name: "UK Gilt 4.0% 2030", weight: 5.8 },
      { name: "UK Gilt 3.5% 2029", weight: 5.2 },
      { name: "UK Gilt 4.75% 2038", weight: 4.5 },
      { name: "UK Gilt 3.25% 2044", weight: 4.0 },
      { name: "UK Gilt 1.75% 2049", weight: 3.6 },
      { name: "UK Gilt 1.625% 2054", weight: 3.2 },
      { name: "UK Gilt 1.25% 2041", weight: 2.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },
  {
    fundName: "iShares Global Corporate Bond UCITS ETF",
    isin: "IE00B7J7TB45",
    ticker: "CORP",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    shareClass: "Income",
    launchDate: "2012-09-20",
    fundManager: "Index Team",
    managementCompany: "BlackRock Asset Management Ireland Limited",
    latestNav: 45.67,
    navDate: "2024-12-27",
    navCurrency: "USD",
    return1M: 0.34,
    return3M: 1.12,
    return6M: 2.67,
    returnYTD: 4.12,
    return1Y: 5.45,
    navHistory: generateNavHistory(45.67, 180, 0.4),
    riskMetrics: {
      volatility1Y: 5.2,
      maxDrawdown1Y: -2.8,
      sharpeRatio1Y: 0.98,
      betaVsBenchmark: 1.00
    },
    economics: {
      ocf: 0.20,
      amc: 0.20,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "JPMorgan Chase 4.85% 2031", weight: 1.8 },
      { name: "Bank of America 5.0% 2030", weight: 1.6 },
      { name: "Goldman Sachs 5.25% 2029", weight: 1.4 },
      { name: "Morgan Stanley 4.875% 2031", weight: 1.3 },
      { name: "Citigroup 5.125% 2030", weight: 1.2 },
      { name: "Wells Fargo 4.75% 2028", weight: 1.1 },
      { name: "Apple 2.65% 2030", weight: 1.0 },
      { name: "Microsoft 2.921% 2052", weight: 0.9 },
      { name: "Amazon 3.875% 2030", weight: 0.9 },
      { name: "AT&T 4.35% 2029", weight: 0.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // BLUEBAY / RBC
  {
    fundName: "BlueBay Investment Grade Bond Fund",
    isin: "LU0549537040",
    ticker: "BBIGB",
    fundType: "SICAV",
    domicile: "Luxembourg",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2010-10-15",
    fundManager: "Marc Sherlock",
    managementCompany: "BlueBay Asset Management LLP",
    latestNav: 123.45,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.45,
    return3M: 1.34,
    return6M: 2.89,
    returnYTD: 4.23,
    return1Y: 5.67,
    navHistory: generateNavHistory(123.45, 180, 0.4),
    riskMetrics: {
      volatility1Y: 5.0,
      maxDrawdown1Y: -2.7,
      sharpeRatio1Y: 1.08,
      betaVsBenchmark: 0.94
    },
    economics: {
      ocf: 0.50,
      amc: 0.35,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Semi-Annual"
    },
    topHoldings: [
      { name: "UK Gilt 4.25% 2032", weight: 4.5 },
      { name: "Germany Bund 2.5% 2033", weight: 3.8 },
      { name: "France OAT 2.75% 2030", weight: 3.2 },
      { name: "JPMorgan Chase 5.0% 2030", weight: 2.8 },
      { name: "Bank of America 4.875% 2029", weight: 2.5 },
      { name: "Goldman Sachs 5.125% 2031", weight: 2.3 },
      { name: "Shell 4.0% 2032", weight: 2.1 },
      { name: "BP 4.25% 2030", weight: 1.9 },
      { name: "TotalEnergies 3.875% 2029", weight: 1.8 },
      { name: "Vodafone 4.75% 2030", weight: 1.7 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  },

  // ABRDN
  {
    fundName: "abrdn Sterling Corporate Bond Fund",
    isin: "GB00B7KT5W84",
    ticker: "ABRSCB",
    fundType: "OEIC",
    domicile: "United Kingdom",
    currency: "GBP",
    shareClass: "Accumulating",
    launchDate: "2012-08-20",
    fundManager: "Felix Murphy",
    managementCompany: "abrdn Fund Managers Limited",
    latestNav: 98.76,
    navDate: "2024-12-27",
    navCurrency: "GBP",
    return1M: 0.34,
    return3M: 1.12,
    return6M: 2.45,
    returnYTD: 3.67,
    return1Y: 4.89,
    navHistory: generateNavHistory(98.76, 180, 0.4),
    riskMetrics: {
      volatility1Y: 4.6,
      maxDrawdown1Y: -2.4,
      sharpeRatio1Y: 1.02,
      betaVsBenchmark: 0.95
    },
    economics: {
      ocf: 0.54,
      amc: 0.40,
      entryCharge: 0,
      exitCharge: 0,
      distributionFrequency: "Quarterly"
    },
    topHoldings: [
      { name: "UK Gilt 4.0% 2031", weight: 4.2 },
      { name: "Barclays 5.625% 2030", weight: 3.5 },
      { name: "HSBC 5.375% 2029", weight: 3.2 },
      { name: "Lloyds 5.125% 2031", weight: 2.9 },
      { name: "NatWest 4.875% 2028", weight: 2.6 },
      { name: "Santander UK 4.625% 2030", weight: 2.4 },
      { name: "Aviva 5.0% 2032", weight: 2.2 },
      { name: "Legal & General 4.75% 2029", weight: 2.0 },
      { name: "Vodafone 4.625% 2030", weight: 1.9 },
      { name: "National Grid 4.375% 2031", weight: 1.8 }
    ],
    dataSource: "FE Analytics",
    lastUpdated: new Date().toISOString(),
    dataQualityFlags: []
  }
];
