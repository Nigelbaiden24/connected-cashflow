// Curated investment categories used by the FlowPulse Finance scraper.
// Each category points to a set of high-signal sources for news, data,
// and opportunity extraction.

export interface InvestmentCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  sources: { name: string; url: string }[];
}

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  {
    id: "stocks-equities",
    label: "Stocks & Equities",
    emoji: "📈",
    description: "Listed equities, IPOs & secondary offerings",
    sources: [
      { name: "MarketWatch — Markets", url: "https://www.marketwatch.com/markets" },
      { name: "Yahoo Finance — Stock Market", url: "https://finance.yahoo.com/topic/stock-market-news/" },
      { name: "CNBC — Markets", url: "https://www.cnbc.com/markets/" },
      { name: "Seeking Alpha — Market News", url: "https://seekingalpha.com/market-news" },
      { name: "Investing.com — Stock News", url: "https://www.investing.com/news/stock-market-news" },
      { name: "Nasdaq — IPO Calendar", url: "https://www.nasdaq.com/market-activity/ipos" },
    ],
  },
  {
    id: "crypto-digital",
    label: "Crypto & Digital Assets",
    emoji: "₿",
    description: "Cryptocurrency and blockchain investments",
    sources: [
      { name: "CoinDesk", url: "https://www.coindesk.com/markets" },
      { name: "CoinTelegraph", url: "https://cointelegraph.com/category/markets" },
      { name: "The Block", url: "https://www.theblock.co/latest" },
      { name: "Decrypt", url: "https://decrypt.co/news" },
      { name: "Messari News", url: "https://messari.io/news" },
      { name: "CoinMarketCap — Headlines", url: "https://coinmarketcap.com/headlines/news/" },
    ],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    emoji: "🏢",
    description: "Commercial & residential property deals",
    sources: [
      { name: "Bisnow — National", url: "https://www.bisnow.com/national" },
      { name: "Commercial Observer", url: "https://commercialobserver.com" },
      { name: "PropertyWeek (UK)", url: "https://www.propertyweek.com" },
      { name: "Costar News", url: "https://www.costar.com/article" },
      { name: "GlobeSt", url: "https://www.globest.com" },
      { name: "React News (UK)", url: "https://reactnews.com" },
    ],
  },
  {
    id: "fixed-income",
    label: "Fixed Income & Bonds",
    emoji: "📊",
    description: "Government & corporate bonds",
    sources: [
      { name: "Reuters — Bonds", url: "https://www.reuters.com/markets/rates-bonds/" },
      { name: "FT — Capital Markets", url: "https://www.ft.com/capital-markets" },
      { name: "Bloomberg — Bond Markets", url: "https://www.bloomberg.com/markets/rates-bonds" },
      { name: "MarketWatch — Bonds", url: "https://www.marketwatch.com/investing/bonds" },
      { name: "Investing.com — Bonds", url: "https://www.investing.com/rates-bonds/" },
    ],
  },
  {
    id: "commodities",
    label: "Commodities",
    emoji: "⛏️",
    description: "Gold, oil, agriculture & natural resources",
    sources: [
      { name: "Mining.com", url: "https://www.mining.com/news/" },
      { name: "OilPrice.com", url: "https://oilprice.com/Latest-Energy-News/World-News/" },
      { name: "Kitco — Gold News", url: "https://www.kitco.com/news/" },
      { name: "Reuters — Commodities", url: "https://www.reuters.com/markets/commodities/" },
      { name: "AgWeb", url: "https://www.agweb.com/markets" },
    ],
  },
  {
    id: "fx",
    label: "Foreign Exchange",
    emoji: "💱",
    description: "FX opportunities & currency markets",
    sources: [
      { name: "FXStreet", url: "https://www.fxstreet.com/news" },
      { name: "DailyFX", url: "https://www.dailyfx.com/market-news" },
      { name: "Investing.com — Forex", url: "https://www.investing.com/news/forex-news" },
      { name: "Reuters — FX", url: "https://www.reuters.com/markets/currencies/" },
      { name: "FX Empire", url: "https://www.fxempire.com/news" },
    ],
  },
  {
    id: "funds-etfs",
    label: "Funds & ETFs",
    emoji: "📋",
    description: "Fund analysis, scoring & selection",
    sources: [
      { name: "Morningstar — News", url: "https://www.morningstar.com/news" },
      { name: "ETF.com — News", url: "https://www.etf.com/sections/news" },
      { name: "Citywire UK", url: "https://citywire.com/funds-insider/news" },
      { name: "Trustnet — News", url: "https://www.trustnet.com/news" },
      { name: "FT Adviser — Investments", url: "https://www.ftadviser.com/investments.html" },
    ],
  },
  {
    id: "alternatives",
    label: "Alternative Investments",
    emoji: "🎨",
    description: "Hedge funds, art, wine & collectibles",
    sources: [
      { name: "Hedge Fund Research", url: "https://www.hfr.com/news" },
      { name: "Institutional Investor — Alternatives", url: "https://www.institutionalinvestor.com/category/Alternatives" },
      { name: "Artnet News — Market", url: "https://news.artnet.com/market" },
      { name: "Liv-ex — News", url: "https://www.liv-ex.com/news-insights/" },
      { name: "Robb Report — Collectibles", url: "https://robbreport.com/lifestyle/auctions/" },
    ],
  },
  {
    id: "esg",
    label: "ESG & Impact Investing",
    emoji: "🌱",
    description: "Sustainable & socially responsible opportunities",
    sources: [
      { name: "ESG Today", url: "https://www.esgtoday.com" },
      { name: "Impact Alpha", url: "https://impactalpha.com/feed-2/" },
      { name: "Responsible Investor", url: "https://www.responsible-investor.com" },
      { name: "GreenBiz", url: "https://www.greenbiz.com/topics/finance" },
      { name: "Sustainable Brands", url: "https://sustainablebrands.com/news_and_views" },
    ],
  },
  {
    id: "private-equity",
    label: "Private Equity",
    emoji: "🏛️",
    description: "Buyouts, growth equity & PE fund opportunities",
    sources: [
      { name: "PE News", url: "https://www.penews.com" },
      { name: "Private Equity Wire", url: "https://www.privateequitywire.co.uk/news/" },
      { name: "PitchBook News", url: "https://pitchbook.com/news" },
      { name: "Buyouts Insider", url: "https://www.buyoutsinsider.com" },
      { name: "Real Deals", url: "https://realdeals.eu.com" },
    ],
  },
  {
    id: "venture-capital",
    label: "Venture Capital",
    emoji: "🚀",
    description: "Early & growth-stage startup investments",
    sources: [
      { name: "TechCrunch — Venture", url: "https://techcrunch.com/category/venture/" },
      { name: "Crunchbase News", url: "https://news.crunchbase.com" },
      { name: "Sifted (Europe)", url: "https://sifted.eu/news" },
      { name: "PitchBook — VC", url: "https://pitchbook.com/news/venture-capital" },
      { name: "VentureBeat", url: "https://venturebeat.com/category/venture/" },
      { name: "UKTN", url: "https://www.uktech.news/funding" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    emoji: "🛠️",
    description: "Energy, transport & digital infrastructure assets",
    sources: [
      { name: "Infrastructure Investor", url: "https://www.infrastructureinvestor.com" },
      { name: "IJGlobal — News", url: "https://ijglobal.com/news" },
      { name: "Reuters — Energy", url: "https://www.reuters.com/business/energy/" },
      { name: "Power Magazine", url: "https://www.powermag.com/news/" },
      { name: "Data Center Dynamics", url: "https://www.datacenterdynamics.com/en/news/" },
    ],
  },
  {
    id: "sme-acquisitions",
    label: "SME Acquisitions",
    emoji: "🤝",
    description: "Small & mid-cap business acquisition deals",
    sources: [
      { name: "BizBuySell — Insights", url: "https://www.bizbuysell.com/learning-center/" },
      { name: "Axial Forum", url: "https://www.axial.net/forum/" },
      { name: "DealStreetAsia — SME", url: "https://www.dealstreetasia.com/category/sme" },
      { name: "Insider Media (UK)", url: "https://www.insidermedia.com/news/national/all" },
      { name: "Business Sale Report", url: "https://www.business-sale.com/insights" },
    ],
  },
  {
    id: "distressed",
    label: "Distressed Assets",
    emoji: "⚠️",
    description: "Special situations & distressed opportunities",
    sources: [
      { name: "Debtwire", url: "https://www.debtwire.com/intelligence" },
      { name: "Reorg", url: "https://reorg.com/insights/" },
      { name: "Restructuring Newswire", url: "https://restructuring-newswire.com" },
      { name: "Distressed Debt Investing", url: "https://distressed-debt-investing.com" },
      { name: "Bloomberg — Distressed", url: "https://www.bloomberg.com/markets/fixed-income" },
    ],
  },
  {
    id: "debt-lending",
    label: "Debt & Lending",
    emoji: "🏦",
    description: "Private credit, direct lending & debt facilities",
    sources: [
      { name: "Private Debt Investor", url: "https://www.privatedebtinvestor.com" },
      { name: "Alt Credit (With Intelligence)", url: "https://www.withintelligence.com/altcredit/news" },
      { name: "Creditflux", url: "https://www.creditflux.com" },
      { name: "GlobalCapital — Loans", url: "https://www.globalcapital.com/loans" },
      { name: "Reuters — Credit Markets", url: "https://www.reuters.com/markets/rates-bonds/" },
    ],
  },
];

export const getCategoryById = (id: string) =>
  INVESTMENT_CATEGORIES.find((c) => c.id === id);
