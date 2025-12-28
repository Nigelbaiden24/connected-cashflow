import type { CompleteFund } from '@/types/fund';

// Comprehensive UK IFA Fund Database - Sample Data
export const fundDatabase: CompleteFund[] = [
  {
    isin: "IE00B4L5Y983",
    ticker: "SWDA",
    sedol: "B4L5Y98",
    name: "iShares Core MSCI World UCITS ETF USD (Acc)",
    provider: "iShares",
    structure: "Passive",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    ucitsStatus: true,
    launchDate: "2009-09-25",
    shareClass: "Accumulating",
    category: "Global Large-Cap Blend Equity",
    subcategory: "Developed Markets",
    assetClass: "Equity",
    aum: 52000,
    aumCurrency: "USD",
    status: "Open",
    performance: {
      dailyNav: 85.42,
      navDate: "2024-12-27",
      ytdReturn: 18.5,
      oneMonthReturn: 2.1,
      threeMonthReturn: 5.8,
      sixMonthReturn: 12.3,
      oneYearReturn: 22.3,
      threeYearReturn: 12.4,
      fiveYearReturn: 14.2,
      tenYearReturn: 11.8,
      sinceInceptionReturn: 13.5,
      rollingOneYear: [22.3, 18.2, 15.6, 24.8, 21.1],
      rollingThreeYear: [12.4, 10.8, 14.2, 11.9, 13.1],
      benchmarkName: "MSCI World Index",
      benchmarkReturn1Y: 21.8,
      benchmarkReturn3Y: 12.1,
      benchmarkReturn5Y: 13.9,
      excessReturn1Y: 0.5,
      excessReturn3Y: 0.3,
      excessReturn5Y: 0.3,
      quartileRank1Y: 2,
      quartileRank3Y: 2,
      quartileRank5Y: 1
    },
    risk: {
      volatility1Y: 12.4,
      volatility3Y: 15.8,
      volatility5Y: 16.2,
      sharpeRatio1Y: 1.65,
      sharpeRatio3Y: 0.72,
      sharpeRatio5Y: 0.81,
      sortinoRatio1Y: 2.12,
      sortinoRatio3Y: 0.98,
      maxDrawdown: -33.7,
      maxDrawdownDate: "2020-03-23",
      currentDrawdown: -2.1,
      alpha3Y: 0.28,
      beta3Y: 0.99,
      rSquared: 0.998,
      trackingError: 0.15,
      informationRatio: 1.87,
      downsideDeviation: 9.8,
      downsideCaptureRatio: 98,
      upsideCaptureRatio: 101,
      srriRating: 5
    },
    costs: {
      ocf: 0.20,
      amc: 0.20,
      transactionCosts: 0.01,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 0.21,
      platformDiscountAvailable: false,
      ocfHistory: [
        { date: "2024-01-01", ocf: 0.20 },
        { date: "2023-01-01", ocf: 0.20 },
        { date: "2022-01-01", ocf: 0.20 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "Apple Inc", isin: "US0378331005", weight: 4.8, sector: "Technology", country: "USA" },
        { name: "Microsoft Corp", isin: "US5949181045", weight: 4.2, sector: "Technology", country: "USA" },
        { name: "NVIDIA Corp", isin: "US67066G1040", weight: 3.8, sector: "Technology", country: "USA" },
        { name: "Amazon.com Inc", isin: "US0231351067", weight: 2.5, sector: "Consumer Discretionary", country: "USA" },
        { name: "Alphabet Inc Class A", isin: "US02079K3059", weight: 2.1, sector: "Technology", country: "USA" },
        { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 1.8, sector: "Technology", country: "USA" },
        { name: "Tesla Inc", isin: "US88160R1014", weight: 1.5, sector: "Consumer Discretionary", country: "USA" },
        { name: "Berkshire Hathaway B", isin: "US0846707026", weight: 1.2, sector: "Financials", country: "USA" },
        { name: "UnitedHealth Group", isin: "US91324P1021", weight: 1.0, sector: "Healthcare", country: "USA" },
        { name: "Johnson & Johnson", isin: "US4781601046", weight: 0.9, sector: "Healthcare", country: "USA" }
      ],
      numberOfHoldings: 1465,
      top10Weight: 23.8,
      sectorExposure: [
        { sector: "Technology", weight: 24.5 },
        { sector: "Financials", weight: 15.2 },
        { sector: "Healthcare", weight: 12.1 },
        { sector: "Consumer Discretionary", weight: 10.8 },
        { sector: "Industrials", weight: 10.5 },
        { sector: "Communication Services", weight: 7.8 },
        { sector: "Consumer Staples", weight: 6.9 },
        { sector: "Energy", weight: 4.5 },
        { sector: "Materials", weight: 4.2 },
        { sector: "Utilities", weight: 2.5 },
        { sector: "Real Estate", weight: 1.0 }
      ],
      regionExposure: [
        { region: "North America", weight: 70.5 },
        { region: "Europe", weight: 16.8 },
        { region: "Japan", weight: 5.8 },
        { region: "Pacific ex Japan", weight: 4.2 },
        { region: "Other", weight: 2.7 }
      ],
      assetClassExposure: [
        { assetClass: "Equity", weight: 99.5 },
        { assetClass: "Cash", weight: 0.5 }
      ],
      currencyExposure: [
        { currency: "USD", weight: 70.5 },
        { currency: "EUR", weight: 10.2 },
        { currency: "JPY", weight: 5.8 },
        { currency: "GBP", weight: 4.1 },
        { currency: "Other", weight: 9.4 }
      ],
      esgRating: "A",
      carbonIntensity: 125,
      sustainabilityScore: 21.5
    },
    classification: {
      marketCapStyle: "Large",
      valueGrowthStyle: "Blend",
      riskBand: "Medium",
      liquidityBand: "Daily",
      esgApproach: "Integration",
      sfdcClassification: "Article 6"
    },
    benchmark: {
      primaryBenchmark: "MSCI World Index",
      primaryBenchmarkTicker: "MXWO",
      peerGroup: "Global Large-Cap Blend Equity",
      peerGroupSize: 245,
      peerGroupRank: 48
    },
    aiInsights: [
      {
        type: "performance",
        severity: "info",
        title: "Consistent top-quartile performer",
        description: "This fund has maintained 2nd quartile or better ranking over 1, 3, and 5 year periods with minimal tracking error.",
        recommendation: "Suitable core holding for global equity allocation.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "cost",
        severity: "info",
        title: "Competitive OCF for passive global exposure",
        description: "At 0.20% OCF, this ranks in the lowest cost quartile for MSCI World tracking funds available on UK platforms.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  },
  {
    isin: "IE00B3XXRP09",
    ticker: "VUSA",
    sedol: "B3XXRP0",
    name: "Vanguard S&P 500 UCITS ETF USD Dist",
    provider: "Vanguard",
    structure: "Passive",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    ucitsStatus: true,
    launchDate: "2012-05-22",
    shareClass: "Income",
    category: "US Large-Cap Blend Equity",
    subcategory: "S&P 500",
    assetClass: "Equity",
    aum: 35000,
    aumCurrency: "USD",
    status: "Open",
    performance: {
      dailyNav: 78.25,
      navDate: "2024-12-27",
      ytdReturn: 22.1,
      oneMonthReturn: 2.8,
      threeMonthReturn: 7.2,
      sixMonthReturn: 14.8,
      oneYearReturn: 26.4,
      threeYearReturn: 14.8,
      fiveYearReturn: 16.1,
      tenYearReturn: 14.2,
      sinceInceptionReturn: 15.8,
      rollingOneYear: [26.4, 22.1, 18.5, 28.7, 24.2],
      rollingThreeYear: [14.8, 12.5, 16.8, 13.9, 15.2],
      benchmarkName: "S&P 500 Index",
      benchmarkReturn1Y: 26.3,
      benchmarkReturn3Y: 14.7,
      benchmarkReturn5Y: 16.0,
      excessReturn1Y: 0.1,
      excessReturn3Y: 0.1,
      excessReturn5Y: 0.1,
      quartileRank1Y: 1,
      quartileRank3Y: 1,
      quartileRank5Y: 1
    },
    risk: {
      volatility1Y: 13.2,
      volatility3Y: 16.5,
      volatility5Y: 17.8,
      sharpeRatio1Y: 1.82,
      sharpeRatio3Y: 0.82,
      sharpeRatio5Y: 0.85,
      sortinoRatio1Y: 2.45,
      sortinoRatio3Y: 1.12,
      maxDrawdown: -33.9,
      maxDrawdownDate: "2020-03-23",
      currentDrawdown: -1.5,
      alpha3Y: 0.08,
      beta3Y: 1.00,
      rSquared: 0.999,
      trackingError: 0.05,
      informationRatio: 1.60,
      downsideDeviation: 10.2,
      downsideCaptureRatio: 100,
      upsideCaptureRatio: 100,
      srriRating: 6
    },
    costs: {
      ocf: 0.07,
      amc: 0.07,
      transactionCosts: 0.00,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 0.07,
      platformDiscountAvailable: false,
      ocfHistory: [
        { date: "2024-01-01", ocf: 0.07 },
        { date: "2023-01-01", ocf: 0.07 },
        { date: "2022-01-01", ocf: 0.07 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "Apple Inc", isin: "US0378331005", weight: 7.2, sector: "Technology", country: "USA" },
        { name: "Microsoft Corp", isin: "US5949181045", weight: 6.8, sector: "Technology", country: "USA" },
        { name: "NVIDIA Corp", isin: "US67066G1040", weight: 5.5, sector: "Technology", country: "USA" },
        { name: "Amazon.com Inc", isin: "US0231351067", weight: 3.8, sector: "Consumer Discretionary", country: "USA" },
        { name: "Alphabet Inc Class A", isin: "US02079K3059", weight: 2.8, sector: "Technology", country: "USA" },
        { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 2.5, sector: "Technology", country: "USA" },
        { name: "Berkshire Hathaway B", isin: "US0846707026", weight: 1.8, sector: "Financials", country: "USA" },
        { name: "Tesla Inc", isin: "US88160R1014", weight: 1.6, sector: "Consumer Discretionary", country: "USA" },
        { name: "UnitedHealth Group", isin: "US91324P1021", weight: 1.4, sector: "Healthcare", country: "USA" },
        { name: "JPMorgan Chase", isin: "US46625H1005", weight: 1.3, sector: "Financials", country: "USA" }
      ],
      numberOfHoldings: 503,
      top10Weight: 34.7,
      sectorExposure: [
        { sector: "Technology", weight: 32.1 },
        { sector: "Healthcare", weight: 12.8 },
        { sector: "Financials", weight: 12.5 },
        { sector: "Consumer Discretionary", weight: 10.2 },
        { sector: "Communication Services", weight: 8.5 },
        { sector: "Industrials", weight: 8.2 },
        { sector: "Consumer Staples", weight: 6.1 },
        { sector: "Energy", weight: 3.8 },
        { sector: "Utilities", weight: 2.5 },
        { sector: "Materials", weight: 2.3 },
        { sector: "Real Estate", weight: 1.0 }
      ],
      regionExposure: [
        { region: "North America", weight: 100 }
      ],
      assetClassExposure: [
        { assetClass: "Equity", weight: 99.8 },
        { assetClass: "Cash", weight: 0.2 }
      ],
      currencyExposure: [
        { currency: "USD", weight: 100 }
      ],
      esgRating: "A",
      carbonIntensity: 140,
      sustainabilityScore: 20.8
    },
    classification: {
      marketCapStyle: "Large",
      valueGrowthStyle: "Blend",
      riskBand: "Medium",
      liquidityBand: "Daily",
      esgApproach: "Integration",
      sfdcClassification: "Article 6"
    },
    benchmark: {
      primaryBenchmark: "S&P 500 Index",
      primaryBenchmarkTicker: "SPX",
      peerGroup: "US Large-Cap Blend Equity",
      peerGroupSize: 312,
      peerGroupRank: 15
    },
    aiInsights: [
      {
        type: "cost",
        severity: "info",
        title: "Ultra-low cost S&P 500 exposure",
        description: "At 0.07% OCF, this is one of the cheapest ways to access the S&P 500 for UK investors.",
        recommendation: "Excellent choice for cost-conscious US equity allocation.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "risk",
        severity: "warning",
        title: "High concentration in tech sector",
        description: "The top 10 holdings represent 34.7% of the fund, with significant technology bias.",
        recommendation: "Consider balancing with value-oriented or international exposure.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  },
  {
    isin: "GB00B3X7QG63",
    ticker: "VFEG",
    sedol: "B3X7QG6",
    name: "Vanguard FTSE Developed World ex-UK Equity Index Fund",
    provider: "Vanguard",
    structure: "Passive",
    fundType: "OEIC",
    domicile: "UK",
    currency: "GBP",
    ucitsStatus: true,
    launchDate: "2010-06-23",
    shareClass: "Accumulating",
    category: "Global Large-Cap Blend Equity ex-UK",
    subcategory: "Developed Markets ex-UK",
    assetClass: "Equity",
    aum: 6200,
    aumCurrency: "GBP",
    status: "Open",
    performance: {
      dailyNav: 512.45,
      navDate: "2024-12-27",
      ytdReturn: 19.8,
      oneMonthReturn: 2.4,
      threeMonthReturn: 6.5,
      sixMonthReturn: 13.2,
      oneYearReturn: 24.1,
      threeYearReturn: 13.2,
      fiveYearReturn: 15.0,
      tenYearReturn: 12.8,
      sinceInceptionReturn: 11.9,
      rollingOneYear: [24.1, 19.5, 16.8, 25.2, 21.8],
      rollingThreeYear: [13.2, 11.5, 14.8, 12.5, 13.8],
      benchmarkName: "FTSE Developed ex-UK Index",
      benchmarkReturn1Y: 23.8,
      benchmarkReturn3Y: 13.0,
      benchmarkReturn5Y: 14.8,
      excessReturn1Y: 0.3,
      excessReturn3Y: 0.2,
      excessReturn5Y: 0.2,
      quartileRank1Y: 1,
      quartileRank3Y: 2,
      quartileRank5Y: 1
    },
    risk: {
      volatility1Y: 12.8,
      volatility3Y: 16.2,
      volatility5Y: 16.8,
      sharpeRatio1Y: 1.72,
      sharpeRatio3Y: 0.75,
      sharpeRatio5Y: 0.82,
      sortinoRatio1Y: 2.28,
      sortinoRatio3Y: 1.02,
      maxDrawdown: -32.5,
      maxDrawdownDate: "2020-03-23",
      currentDrawdown: -1.8,
      alpha3Y: 0.18,
      beta3Y: 0.99,
      rSquared: 0.997,
      trackingError: 0.12,
      informationRatio: 1.50,
      downsideDeviation: 10.0,
      downsideCaptureRatio: 99,
      upsideCaptureRatio: 100,
      srriRating: 5
    },
    costs: {
      ocf: 0.14,
      amc: 0.14,
      transactionCosts: 0.01,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 0.15,
      platformDiscountAvailable: true,
      ocfHistory: [
        { date: "2024-01-01", ocf: 0.14 },
        { date: "2023-01-01", ocf: 0.14 },
        { date: "2022-01-01", ocf: 0.15 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "Apple Inc", isin: "US0378331005", weight: 5.2, sector: "Technology", country: "USA" },
        { name: "Microsoft Corp", isin: "US5949181045", weight: 4.8, sector: "Technology", country: "USA" },
        { name: "NVIDIA Corp", isin: "US67066G1040", weight: 4.1, sector: "Technology", country: "USA" },
        { name: "Amazon.com Inc", isin: "US0231351067", weight: 2.8, sector: "Consumer Discretionary", country: "USA" },
        { name: "Alphabet Inc Class A", isin: "US02079K3059", weight: 2.3, sector: "Technology", country: "USA" },
        { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 2.0, sector: "Technology", country: "USA" },
        { name: "Tesla Inc", isin: "US88160R1014", weight: 1.6, sector: "Consumer Discretionary", country: "USA" },
        { name: "Berkshire Hathaway B", isin: "US0846707026", weight: 1.3, sector: "Financials", country: "USA" },
        { name: "TSMC", isin: "TW0002330008", weight: 1.2, sector: "Technology", country: "Taiwan" },
        { name: "Novo Nordisk", isin: "DK0060534915", weight: 1.0, sector: "Healthcare", country: "Denmark" }
      ],
      numberOfHoldings: 2089,
      top10Weight: 26.3,
      sectorExposure: [
        { sector: "Technology", weight: 25.8 },
        { sector: "Financials", weight: 14.5 },
        { sector: "Healthcare", weight: 12.2 },
        { sector: "Consumer Discretionary", weight: 11.1 },
        { sector: "Industrials", weight: 10.8 },
        { sector: "Communication Services", weight: 7.5 },
        { sector: "Consumer Staples", weight: 6.5 },
        { sector: "Energy", weight: 4.2 },
        { sector: "Materials", weight: 4.0 },
        { sector: "Utilities", weight: 2.4 },
        { sector: "Real Estate", weight: 1.0 }
      ],
      regionExposure: [
        { region: "North America", weight: 68.5 },
        { region: "Europe ex-UK", weight: 14.2 },
        { region: "Japan", weight: 6.5 },
        { region: "Pacific ex Japan", weight: 5.8 },
        { region: "Emerging Markets", weight: 5.0 }
      ],
      assetClassExposure: [
        { assetClass: "Equity", weight: 99.6 },
        { assetClass: "Cash", weight: 0.4 }
      ],
      currencyExposure: [
        { currency: "USD", weight: 68.5 },
        { currency: "EUR", weight: 10.5 },
        { currency: "JPY", weight: 6.5 },
        { currency: "CHF", weight: 3.2 },
        { currency: "Other", weight: 11.3 }
      ],
      esgRating: "A",
      carbonIntensity: 130,
      sustainabilityScore: 21.2
    },
    classification: {
      marketCapStyle: "Large",
      valueGrowthStyle: "Blend",
      riskBand: "Medium",
      liquidityBand: "Daily",
      esgApproach: "Integration",
      sfdcClassification: "Article 6"
    },
    benchmark: {
      primaryBenchmark: "FTSE Developed ex-UK Index",
      primaryBenchmarkTicker: "AWXUKGBP",
      peerGroup: "Global Large-Cap Blend ex-UK",
      peerGroupSize: 178,
      peerGroupRank: 22
    },
    aiInsights: [
      {
        type: "performance",
        severity: "info",
        title: "Strong UK pension portfolio complement",
        description: "This fund provides excellent diversification for UK-based portfolios by excluding UK exposure.",
        recommendation: "Ideal core holding when combined with separate UK allocation.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  },
  {
    isin: "IE00B4L5YC18",
    ticker: "EIMI",
    sedol: "B4L5YC1",
    name: "iShares Core MSCI EM IMI UCITS ETF USD (Acc)",
    provider: "iShares",
    structure: "Passive",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "USD",
    ucitsStatus: true,
    launchDate: "2014-05-30",
    shareClass: "Accumulating",
    category: "Emerging Markets Equity",
    subcategory: "Broad EM",
    assetClass: "Equity",
    aum: 18000,
    aumCurrency: "USD",
    status: "Open",
    performance: {
      dailyNav: 28.75,
      navDate: "2024-12-27",
      ytdReturn: 5.2,
      oneMonthReturn: -1.5,
      threeMonthReturn: 1.8,
      sixMonthReturn: 4.5,
      oneYearReturn: 8.7,
      threeYearReturn: 2.1,
      fiveYearReturn: 5.4,
      sinceInceptionReturn: 4.8,
      rollingOneYear: [8.7, 5.2, -2.5, 12.8, 6.5],
      rollingThreeYear: [2.1, 1.5, 4.2, 0.8, 2.8],
      benchmarkName: "MSCI Emerging Markets IMI Index",
      benchmarkReturn1Y: 8.5,
      benchmarkReturn3Y: 2.0,
      benchmarkReturn5Y: 5.2,
      excessReturn1Y: 0.2,
      excessReturn3Y: 0.1,
      excessReturn5Y: 0.2,
      quartileRank1Y: 2,
      quartileRank3Y: 2,
      quartileRank5Y: 2
    },
    risk: {
      volatility1Y: 15.8,
      volatility3Y: 18.5,
      volatility5Y: 19.2,
      sharpeRatio1Y: 0.42,
      sharpeRatio3Y: 0.05,
      sharpeRatio5Y: 0.22,
      sortinoRatio1Y: 0.58,
      sortinoRatio3Y: 0.08,
      maxDrawdown: -35.2,
      maxDrawdownDate: "2020-03-23",
      currentDrawdown: -8.5,
      alpha3Y: 0.08,
      beta3Y: 1.00,
      rSquared: 0.998,
      trackingError: 0.18,
      informationRatio: 0.44,
      downsideDeviation: 12.5,
      downsideCaptureRatio: 100,
      upsideCaptureRatio: 101,
      srriRating: 6
    },
    costs: {
      ocf: 0.18,
      amc: 0.18,
      transactionCosts: 0.02,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 0.20,
      platformDiscountAvailable: false,
      ocfHistory: [
        { date: "2024-01-01", ocf: 0.18 },
        { date: "2023-01-01", ocf: 0.18 },
        { date: "2022-01-01", ocf: 0.18 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "Taiwan Semiconductor", isin: "TW0002330008", weight: 8.5, sector: "Technology", country: "Taiwan" },
        { name: "Tencent Holdings", isin: "KYG875721634", weight: 4.2, sector: "Communication Services", country: "China" },
        { name: "Samsung Electronics", isin: "KR7005930003", weight: 3.8, sector: "Technology", country: "South Korea" },
        { name: "Alibaba Group", isin: "KYG017191142", weight: 2.1, sector: "Consumer Discretionary", country: "China" },
        { name: "Reliance Industries", isin: "INE002A01018", weight: 1.5, sector: "Energy", country: "India" },
        { name: "China Construction Bank", isin: "CNE1000002H1", weight: 1.2, sector: "Financials", country: "China" },
        { name: "Meituan", isin: "KYG596691041", weight: 1.1, sector: "Consumer Discretionary", country: "China" },
        { name: "Infosys", isin: "INE009A01021", weight: 1.0, sector: "Technology", country: "India" },
        { name: "ICBC", isin: "CNE1000003G1", weight: 0.9, sector: "Financials", country: "China" },
        { name: "Ping An Insurance", isin: "CNE1000003X6", weight: 0.8, sector: "Financials", country: "China" }
      ],
      numberOfHoldings: 3128,
      top10Weight: 25.1,
      sectorExposure: [
        { sector: "Technology", weight: 22.5 },
        { sector: "Financials", weight: 21.8 },
        { sector: "Consumer Discretionary", weight: 13.2 },
        { sector: "Communication Services", weight: 9.5 },
        { sector: "Materials", weight: 8.2 },
        { sector: "Energy", weight: 6.5 },
        { sector: "Industrials", weight: 6.2 },
        { sector: "Consumer Staples", weight: 5.8 },
        { sector: "Healthcare", weight: 3.5 },
        { sector: "Utilities", weight: 2.0 },
        { sector: "Real Estate", weight: 0.8 }
      ],
      regionExposure: [
        { region: "China", weight: 28.5 },
        { region: "Taiwan", weight: 18.2 },
        { region: "India", weight: 17.8 },
        { region: "South Korea", weight: 12.5 },
        { region: "Brazil", weight: 5.2 },
        { region: "Other EM", weight: 17.8 }
      ],
      assetClassExposure: [
        { assetClass: "Equity", weight: 99.2 },
        { assetClass: "Cash", weight: 0.8 }
      ],
      currencyExposure: [
        { currency: "TWD", weight: 18.2 },
        { currency: "CNY", weight: 15.5 },
        { currency: "INR", weight: 17.8 },
        { currency: "KRW", weight: 12.5 },
        { currency: "USD", weight: 10.5 },
        { currency: "Other", weight: 25.5 }
      ],
      esgRating: "BBB",
      carbonIntensity: 285,
      sustainabilityScore: 25.8
    },
    classification: {
      marketCapStyle: "Large",
      valueGrowthStyle: "Blend",
      riskBand: "High",
      liquidityBand: "Daily",
      esgApproach: "Integration",
      sfdcClassification: "Article 6"
    },
    benchmark: {
      primaryBenchmark: "MSCI Emerging Markets IMI Index",
      primaryBenchmarkTicker: "MXEFIMI",
      peerGroup: "Emerging Markets Equity",
      peerGroupSize: 198,
      peerGroupRank: 45
    },
    aiInsights: [
      {
        type: "risk",
        severity: "warning",
        title: "Higher volatility and geopolitical risk",
        description: "EM exposure brings elevated risk from currency movements, political uncertainty, and regulatory changes.",
        recommendation: "Limit allocation to 10-15% for moderate risk portfolios.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "performance",
        severity: "info",
        title: "Long-term diversification benefits",
        description: "Despite recent underperformance vs developed markets, EM provides valuable diversification and growth potential.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  },
  {
    isin: "IE00B3F81R35",
    ticker: "IEAC",
    sedol: "B3F81R3",
    name: "iShares Core € Corp Bond UCITS ETF EUR (Dist)",
    provider: "iShares",
    structure: "Passive",
    fundType: "ETF",
    domicile: "Ireland",
    currency: "EUR",
    ucitsStatus: true,
    launchDate: "2009-09-16",
    shareClass: "Income",
    category: "EUR Corporate Bond",
    subcategory: "Investment Grade",
    assetClass: "Fixed Income",
    aum: 12000,
    aumCurrency: "EUR",
    status: "Open",
    performance: {
      dailyNav: 122.85,
      navDate: "2024-12-27",
      ytdReturn: 4.8,
      oneMonthReturn: 0.5,
      threeMonthReturn: 1.2,
      sixMonthReturn: 3.5,
      oneYearReturn: 6.2,
      threeYearReturn: 1.5,
      fiveYearReturn: 2.1,
      sinceInceptionReturn: 3.8,
      rollingOneYear: [6.2, 4.5, -8.2, 2.1, 5.8],
      rollingThreeYear: [1.5, -1.2, 2.8, 0.5, 1.8],
      benchmarkName: "Bloomberg Euro Aggregate Corporate Index",
      benchmarkReturn1Y: 6.0,
      benchmarkReturn3Y: 1.4,
      benchmarkReturn5Y: 2.0,
      excessReturn1Y: 0.2,
      excessReturn3Y: 0.1,
      excessReturn5Y: 0.1,
      quartileRank1Y: 2,
      quartileRank3Y: 2,
      quartileRank5Y: 2
    },
    risk: {
      volatility1Y: 4.2,
      volatility3Y: 6.8,
      volatility5Y: 5.8,
      sharpeRatio1Y: 1.19,
      sharpeRatio3Y: 0.15,
      sharpeRatio5Y: 0.28,
      sortinoRatio1Y: 1.65,
      sortinoRatio3Y: 0.22,
      maxDrawdown: -18.5,
      maxDrawdownDate: "2022-10-15",
      currentDrawdown: -5.2,
      alpha3Y: 0.05,
      beta3Y: 0.98,
      rSquared: 0.995,
      trackingError: 0.08,
      informationRatio: 0.63,
      downsideDeviation: 3.5,
      downsideCaptureRatio: 99,
      upsideCaptureRatio: 101,
      srriRating: 3
    },
    costs: {
      ocf: 0.20,
      amc: 0.20,
      transactionCosts: 0.01,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 0.21,
      platformDiscountAvailable: false,
      ocfHistory: [
        { date: "2024-01-01", ocf: 0.20 },
        { date: "2023-01-01", ocf: 0.20 },
        { date: "2022-01-01", ocf: 0.20 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "Deutsche Bank 5.625% 2031", weight: 0.8, sector: "Financials" },
        { name: "BNP Paribas 4.875% 2032", weight: 0.7, sector: "Financials" },
        { name: "Volkswagen 4.25% 2030", weight: 0.6, sector: "Consumer Discretionary" },
        { name: "Total SE 3.875% 2029", weight: 0.5, sector: "Energy" },
        { name: "Siemens 3.5% 2028", weight: 0.5, sector: "Industrials" },
        { name: "LVMH 3.25% 2031", weight: 0.4, sector: "Consumer Discretionary" },
        { name: "Santander 4.75% 2030", weight: 0.4, sector: "Financials" },
        { name: "BMW 3.125% 2027", weight: 0.4, sector: "Consumer Discretionary" },
        { name: "Orange SA 2.875% 2029", weight: 0.3, sector: "Communication Services" },
        { name: "Enel 4.125% 2032", weight: 0.3, sector: "Utilities" }
      ],
      numberOfHoldings: 3245,
      top10Weight: 4.9,
      sectorExposure: [
        { sector: "Financials", weight: 42.5 },
        { sector: "Consumer Discretionary", weight: 12.8 },
        { sector: "Industrials", weight: 11.5 },
        { sector: "Utilities", weight: 10.2 },
        { sector: "Communication Services", weight: 8.5 },
        { sector: "Energy", weight: 6.2 },
        { sector: "Consumer Staples", weight: 4.5 },
        { sector: "Technology", weight: 2.5 },
        { sector: "Healthcare", weight: 1.3 }
      ],
      regionExposure: [
        { region: "France", weight: 25.2 },
        { region: "Germany", weight: 18.5 },
        { region: "Netherlands", weight: 12.8 },
        { region: "Spain", weight: 10.2 },
        { region: "Italy", weight: 8.5 },
        { region: "UK", weight: 6.8 },
        { region: "Other Europe", weight: 18.0 }
      ],
      assetClassExposure: [
        { assetClass: "Fixed Income", weight: 99.5 },
        { assetClass: "Cash", weight: 0.5 }
      ],
      currencyExposure: [
        { currency: "EUR", weight: 100 }
      ],
      creditQualityBreakdown: [
        { rating: "AAA", weight: 2.5 },
        { rating: "AA", weight: 8.5 },
        { rating: "A", weight: 38.2 },
        { rating: "BBB", weight: 50.8 }
      ],
      durationYears: 4.8,
      yieldToMaturity: 3.85,
      averageCreditRating: "BBB+",
      esgRating: "A",
      carbonIntensity: 85,
      sustainabilityScore: 19.5
    },
    classification: {
      durationBand: "Intermediate",
      creditQualityBand: "Investment Grade",
      riskBand: "Low",
      liquidityBand: "Daily",
      esgApproach: "Integration",
      sfdcClassification: "Article 6"
    },
    benchmark: {
      primaryBenchmark: "Bloomberg Euro Aggregate Corporate Index",
      primaryBenchmarkTicker: "LECPTREU",
      peerGroup: "EUR Corporate Bond",
      peerGroupSize: 145,
      peerGroupRank: 32
    },
    aiInsights: [
      {
        type: "risk",
        severity: "info",
        title: "Duration risk in rising rate environment",
        description: "With 4.8 year duration, the fund is sensitive to interest rate changes. Each 1% rate rise could result in ~4.8% NAV decline.",
        recommendation: "Consider shorter duration alternatives if expecting rate rises.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "cost",
        severity: "info",
        title: "Competitive fixed income costs",
        description: "At 0.20% OCF, this is among the cheapest EUR corporate bond exposures available.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  },
  {
    isin: "LU0378449770",
    ticker: "CGEU",
    name: "Comgest Growth Europe",
    provider: "Comgest",
    structure: "Active",
    fundType: "SICAV",
    domicile: "Luxembourg",
    currency: "EUR",
    ucitsStatus: true,
    launchDate: "1991-10-01",
    shareClass: "Accumulating",
    category: "Europe Large-Cap Growth Equity",
    subcategory: "Quality Growth",
    assetClass: "Equity",
    aum: 8500,
    aumCurrency: "EUR",
    status: "Open",
    performance: {
      dailyNav: 42.85,
      navDate: "2024-12-27",
      ytdReturn: 12.4,
      oneMonthReturn: 1.8,
      threeMonthReturn: 4.2,
      sixMonthReturn: 8.5,
      oneYearReturn: 15.8,
      threeYearReturn: 8.9,
      fiveYearReturn: 10.2,
      tenYearReturn: 9.5,
      sinceInceptionReturn: 10.8,
      rollingOneYear: [15.8, 12.2, 8.5, 18.5, 14.2],
      rollingThreeYear: [8.9, 7.5, 10.2, 6.8, 9.5],
      benchmarkName: "MSCI Europe Index",
      benchmarkReturn1Y: 12.5,
      benchmarkReturn3Y: 7.2,
      benchmarkReturn5Y: 8.5,
      excessReturn1Y: 3.3,
      excessReturn3Y: 1.7,
      excessReturn5Y: 1.7,
      quartileRank1Y: 1,
      quartileRank3Y: 1,
      quartileRank5Y: 1
    },
    risk: {
      volatility1Y: 11.5,
      volatility3Y: 14.8,
      volatility5Y: 15.5,
      sharpeRatio1Y: 1.22,
      sharpeRatio3Y: 0.52,
      sharpeRatio5Y: 0.58,
      sortinoRatio1Y: 1.68,
      sortinoRatio3Y: 0.72,
      maxDrawdown: -28.5,
      maxDrawdownDate: "2020-03-23",
      currentDrawdown: -4.5,
      alpha3Y: 1.52,
      beta3Y: 0.85,
      rSquared: 0.92,
      trackingError: 4.8,
      informationRatio: 0.35,
      downsideDeviation: 9.2,
      downsideCaptureRatio: 82,
      upsideCaptureRatio: 95,
      srriRating: 5
    },
    costs: {
      ocf: 1.58,
      amc: 1.50,
      transactionCosts: 0.08,
      entryFee: 0,
      exitFee: 0,
      totalCostOfOwnership: 1.58,
      platformDiscountAvailable: true,
      ocfHistory: [
        { date: "2024-01-01", ocf: 1.58 },
        { date: "2023-01-01", ocf: 1.60 },
        { date: "2022-01-01", ocf: 1.62 }
      ]
    },
    exposure: {
      topHoldings: [
        { name: "LVMH", isin: "FR0000121014", weight: 6.8, sector: "Consumer Discretionary", country: "France" },
        { name: "ASML", isin: "NL0010273215", weight: 6.2, sector: "Technology", country: "Netherlands" },
        { name: "Novo Nordisk", isin: "DK0060534915", weight: 5.8, sector: "Healthcare", country: "Denmark" },
        { name: "L'Oréal", isin: "FR0000120321", weight: 5.2, sector: "Consumer Staples", country: "France" },
        { name: "SAP", isin: "DE0007164600", weight: 4.8, sector: "Technology", country: "Germany" },
        { name: "Hermès", isin: "FR0000052292", weight: 4.5, sector: "Consumer Discretionary", country: "France" },
        { name: "Air Liquide", isin: "FR0000120073", weight: 4.2, sector: "Materials", country: "France" },
        { name: "Dassault Systèmes", isin: "FR0014003TT8", weight: 3.8, sector: "Technology", country: "France" },
        { name: "Schneider Electric", isin: "FR0000121972", weight: 3.5, sector: "Industrials", country: "France" },
        { name: "Lonza", isin: "CH0013841017", weight: 3.2, sector: "Healthcare", country: "Switzerland" }
      ],
      numberOfHoldings: 35,
      top10Weight: 48.0,
      sectorExposure: [
        { sector: "Healthcare", weight: 28.5 },
        { sector: "Technology", weight: 22.5 },
        { sector: "Consumer Discretionary", weight: 18.2 },
        { sector: "Consumer Staples", weight: 12.8 },
        { sector: "Industrials", weight: 10.5 },
        { sector: "Materials", weight: 5.2 },
        { sector: "Financials", weight: 2.3 }
      ],
      regionExposure: [
        { region: "France", weight: 42.5 },
        { region: "Switzerland", weight: 15.2 },
        { region: "Netherlands", weight: 12.5 },
        { region: "Denmark", weight: 10.8 },
        { region: "Germany", weight: 10.2 },
        { region: "Other Europe", weight: 8.8 }
      ],
      assetClassExposure: [
        { assetClass: "Equity", weight: 97.5 },
        { assetClass: "Cash", weight: 2.5 }
      ],
      currencyExposure: [
        { currency: "EUR", weight: 65.2 },
        { currency: "CHF", weight: 15.2 },
        { currency: "DKK", weight: 10.8 },
        { currency: "Other", weight: 8.8 }
      ],
      esgRating: "AA",
      carbonIntensity: 45,
      sustainabilityScore: 18.2
    },
    classification: {
      marketCapStyle: "Large",
      valueGrowthStyle: "Growth",
      riskBand: "Medium",
      liquidityBand: "Daily",
      esgApproach: "Best-in-Class",
      sfdcClassification: "Article 8"
    },
    benchmark: {
      primaryBenchmark: "MSCI Europe Index",
      primaryBenchmarkTicker: "MXEU",
      peerGroup: "Europe Large-Cap Growth",
      peerGroupSize: 125,
      peerGroupRank: 8
    },
    aiInsights: [
      {
        type: "performance",
        severity: "info",
        title: "Consistent alpha generation",
        description: "Comgest's quality-growth approach has delivered consistent outperformance with lower downside capture.",
        recommendation: "Suitable active core holding for European equity allocation.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "cost",
        severity: "warning",
        title: "Higher OCF vs passive alternatives",
        description: "At 1.58% OCF, the fund costs significantly more than passive European ETFs (0.10-0.20%).",
        recommendation: "Evaluate whether alpha justifies the fee premium for your clients.",
        generatedAt: "2024-12-27T10:00:00Z"
      },
      {
        type: "risk",
        severity: "info",
        title: "Concentrated portfolio",
        description: "With only 35 holdings and 48% in top 10, this is a high-conviction strategy.",
        generatedAt: "2024-12-27T10:00:00Z"
      }
    ],
    lastUpdated: "2024-12-27T10:00:00Z"
  }
];

// Categories for filters
export const fundCategories = [
  "Global Large-Cap Blend Equity",
  "US Large-Cap Blend Equity",
  "Global Large-Cap Blend Equity ex-UK",
  "Emerging Markets Equity",
  "EUR Corporate Bond",
  "Europe Large-Cap Growth Equity",
  "UK Equity",
  "Asia Pacific Equity",
  "Global High Yield Bond",
  "Multi-Asset",
  "Thematic"
];

export const fundProviders = [
  "iShares",
  "Vanguard",
  "Comgest",
  "Fidelity",
  "PIMCO",
  "BlackRock",
  "JPMorgan",
  "Schroders",
  "Invesco",
  "Legal & General"
];

export const assetClasses = [
  "Equity",
  "Fixed Income",
  "Multi-Asset",
  "Alternatives",
  "Money Market",
  "Commodity"
];

export const fundTypes = [
  "ETF",
  "OEIC",
  "SICAV",
  "Unit Trust",
  "Investment Trust"
];
