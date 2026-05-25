// Curated investment categories for the FlowPulse admin scraper.
// These map 1:1 to the categories shown on the FlowPulse Investor
// "Opportunity Intelligence" tab. Stocks/Crypto are intentionally excluded —
// this taxonomy is for individual investors and HNW opportunity deal flow only.

export interface InvestmentCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  // Group key matching the Opportunity Intelligence categoryConfig
  group:
    | "real_estate"
    | "commodities"
    | "alternatives"
    | "esg"
    | "fractional_pe_vc"
    | "private_market_platforms"
    | "capital_protected_notes"
    | "thematics_packaged"
    | "copy_trading"
    | "royalties"
    | "businesses"
    | "mini_bonds"
    | "timepieces"
    | "fine_wine"
    | "art"
    | "collectibles"
    | "luxury_assets"
    | "entertainment_finance"
    | "insurance_investments"
    | "sports_investments";
  sources: { name: string; url: string }[];
}

// FlowPulse Investor curated scrape topics.
export const INVESTOR_OPPORTUNITY_TOPICS: InvestmentCategory[] = [
  // ─── Real Estate ───────────────────────────────────────────────
  { id: "rent-to-rent", label: "Rent to Rent", emoji: "🏘️", description: "Sub-letting & rent-to-rent UK deals", group: "real_estate",
    sources: [
      { name: "PropertyTribes — R2R", url: "https://www.propertytribes.com/rent-to-rent-f60.html" },
      { name: "PropertyHub", url: "https://propertyhub.net/blog/" },
      { name: "Rightmove News", url: "https://www.rightmove.co.uk/news/" },
    ]},
  { id: "rent-to-sa", label: "Rent to Serviced Accommodation", emoji: "🛏️", description: "R2SA short-let arbitrage opportunities", group: "real_estate",
    sources: [
      { name: "ShortTermRentalz", url: "https://www.shorttermrentalz.com" },
      { name: "AirDNA — Insights", url: "https://www.airdna.co/blog" },
      { name: "PropertyInvestorToday", url: "https://www.propertyinvestortoday.co.uk" },
    ]},
  { id: "residential-property", label: "Residential Property", emoji: "🏠", description: "Residential investment property deals", group: "real_estate",
    sources: [
      { name: "Rightmove", url: "https://www.rightmove.co.uk/news/" },
      { name: "Zoopla News", url: "https://www.zoopla.co.uk/discover/" },
      { name: "Savills Research", url: "https://www.savills.co.uk/research_articles/229130/list" },
    ]},
  { id: "commercial-property", label: "Commercial Property", emoji: "🏢", description: "Office, retail & commercial assets", group: "real_estate",
    sources: [
      { name: "CoStar UK", url: "https://www.costar.com/article" },
      { name: "PropertyWeek", url: "https://www.propertyweek.com" },
      { name: "React News", url: "https://reactnews.com" },
    ]},
  { id: "industrial-property", label: "Industrial Property", emoji: "🏭", description: "Industrial, logistics & warehouse deals", group: "real_estate",
    sources: [
      { name: "Logistics Manager", url: "https://www.logisticsmanager.com/category/property/" },
      { name: "Industrial Sheds", url: "https://www.shedkm.co.uk/insights" },
    ]},
  { id: "student-housing", label: "Student Housing", emoji: "🎓", description: "PBSA & student accommodation deals", group: "real_estate",
    sources: [
      { name: "Student Crowd", url: "https://www.studentcrowd.com" },
      { name: "Knight Frank — Student", url: "https://www.knightfrank.com/research/topic/student-property" },
    ]},
  { id: "holiday-rentals", label: "Holiday Rentals", emoji: "🏖️", description: "Holiday let & STR investments", group: "real_estate",
    sources: [
      { name: "Sykes Cottages — Insights", url: "https://www.sykescottages.co.uk/blog/" },
      { name: "AirDNA Reports", url: "https://www.airdna.co/reports" },
    ]},
  { id: "build-to-rent", label: "Build-to-Rent", emoji: "🏗️", description: "BTR & multifamily development", group: "real_estate",
    sources: [
      { name: "BPF — BTR", url: "https://bpf.org.uk/our-work/build-to-rent/" },
      { name: "PropertyWeek BTR", url: "https://www.propertyweek.com/news/build-to-rent" },
    ]},
  { id: "land-banking", label: "Land Banking", emoji: "🌾", description: "Strategic land acquisitions", group: "real_estate",
    sources: [
      { name: "Land Investments", url: "https://www.landinvestmentscompany.co.uk/news" },
      { name: "Plotfinder", url: "https://www.plotfinder.net/news" },
    ]},
  { id: "farmland", label: "Farmland", emoji: "🚜", description: "Agricultural land investments", group: "real_estate",
    sources: [
      { name: "Savills Rural", url: "https://www.savills.co.uk/research_articles/229130/list/rural" },
      { name: "Farmers Weekly", url: "https://www.fwi.co.uk/business/markets-and-trends/land-markets" },
    ]},
  { id: "international-property", label: "International Property & Land", emoji: "🌍", description: "Overseas property and land deals", group: "real_estate",
    sources: [
      { name: "Knight Frank Global", url: "https://www.knightfrank.com/research" },
      { name: "Bloomberg — Global Property", url: "https://www.bloomberg.com/markets/real-estate" },
    ]},

  // ─── Commodities ───────────────────────────────────────────────
  { id: "oil", label: "Oil", emoji: "🛢️", description: "Crude oil & energy markets", group: "commodities",
    sources: [
      { name: "OilPrice.com", url: "https://oilprice.com/Latest-Energy-News/World-News/" },
      { name: "Reuters — Energy", url: "https://www.reuters.com/business/energy/" },
    ]},
  { id: "natural-gas", label: "Natural Gas", emoji: "🔥", description: "Natural gas markets & contracts", group: "commodities",
    sources: [
      { name: "Natural Gas Intelligence", url: "https://naturalgasintel.com" },
      { name: "Reuters — Gas", url: "https://www.reuters.com/business/energy/" },
    ]},
  { id: "wheat", label: "Wheat", emoji: "🌾", description: "Wheat & grain commodity markets", group: "commodities",
    sources: [
      { name: "AgWeb — Markets", url: "https://www.agweb.com/markets" },
      { name: "USDA — Grains", url: "https://www.fas.usda.gov/data-analysis/commodity" },
    ]},
  { id: "coffee", label: "Coffee", emoji: "☕", description: "Coffee futures & supply markets", group: "commodities",
    sources: [
      { name: "Daily Coffee News", url: "https://dailycoffeenews.com" },
      { name: "ICO — Coffee", url: "https://www.ico.org/news.asp" },
    ]},
  { id: "livestock", label: "Livestock", emoji: "🐄", description: "Cattle & livestock markets", group: "commodities",
    sources: [
      { name: "AgWeb — Livestock", url: "https://www.agweb.com/markets/livestock-markets" },
      { name: "Drovers", url: "https://www.drovers.com/markets" },
    ]},

  // ─── Alternatives ──────────────────────────────────────────────
  { id: "alternative-investments", label: "Alternative Investments", emoji: "🎨", description: "Hedge funds & alternative strategies", group: "alternatives",
    sources: [
      { name: "Institutional Investor — Alts", url: "https://www.institutionalinvestor.com/category/Alternatives" },
      { name: "Hedge Fund Research", url: "https://www.hfr.com/news" },
    ]},

  // ─── ESG ───────────────────────────────────────────────────────
  { id: "esg-impact", label: "ESG & Impact Investing", emoji: "🌱", description: "Sustainable & impact opportunities", group: "esg",
    sources: [
      { name: "ESG Today", url: "https://www.esgtoday.com" },
      { name: "Impact Alpha", url: "https://impactalpha.com/feed-2/" },
      { name: "Responsible Investor", url: "https://www.responsible-investor.com" },
    ]},

  // ─── Fractional PE / VC ────────────────────────────────────────
  { id: "fractional-pe-vc", label: "Fractional PE / VC", emoji: "💎", description: "Crowdfunding, syndicates & fractional deals", group: "fractional_pe_vc",
    sources: [
      { name: "Crowdcube", url: "https://www.crowdcube.com/explore" },
      { name: "Seedrs", url: "https://www.seedrs.com/invest" },
      { name: "Republic", url: "https://republic.com/invest" },
      { name: "AngelList — Syndicates", url: "https://www.angellist.com/syndicates" },
      { name: "Wefunder", url: "https://wefunder.com/explore/all" },
      { name: "Moonfare — Insights", url: "https://www.moonfare.com/insights" },
    ]},

  // ─── Private Market Platforms ──────────────────────────────────
  { id: "pre-ipo", label: "Pre-IPO", emoji: "🚀", description: "Pre-IPO secondary share opportunities", group: "private_market_platforms",
    sources: [
      { name: "Forge Global", url: "https://forgeglobal.com/insights/" },
      { name: "EquityZen", url: "https://equityzen.com/knowledge-center/" },
      { name: "Hiive", url: "https://www.hiive.com/insights" },
    ]},
  { id: "private-market-platforms", label: "Private Market Platforms", emoji: "🔁", description: "Secondary share marketplaces", group: "private_market_platforms",
    sources: [
      { name: "Nasdaq Private Market", url: "https://www.nasdaqprivatemarket.com/insights/" },
      { name: "Carta — Private Markets", url: "https://carta.com/blog/category/private-markets/" },
    ]},

  // ─── Capital-Protected & Income Notes ──────────────────────────
  { id: "capital-protected-notes", label: "Capital-Protected & Income Notes", emoji: "🛡️", description: "Structured notes with capital protection or income", group: "capital_protected_notes",
    sources: [
      { name: "StructuredRetailProducts", url: "https://www.structuredretailproducts.com/news" },
      { name: "Investment Week — Structured", url: "https://www.investmentweek.co.uk/category/structured-products" },
      { name: "FT Adviser — Structured", url: "https://www.ftadviser.com/investments/structured-products.html" },
    ]},

  // ─── Thematics & Packaged ──────────────────────────────────────
  { id: "thematics-packaged", label: "Thematics & Packaged Investing", emoji: "📦", description: "Thematic baskets & packaged products", group: "thematics_packaged",
    sources: [
      { name: "ARK Invest", url: "https://www.ark-invest.com/research" },
      { name: "Global X", url: "https://www.globalxetfs.com/research/" },
      { name: "iShares Insights", url: "https://www.ishares.com/uk/individual/en/insights" },
      { name: "ETF Stream — Themes", url: "https://www.etfstream.com/topic/thematic" },
    ]},

  // ─── Copy Trading ──────────────────────────────────────────────
  { id: "copy-trading", label: "Copy Trading", emoji: "👥", description: "Mirror & social trading strategies", group: "copy_trading",
    sources: [
      { name: "eToro — News", url: "https://www.etoro.com/news-and-analysis/" },
      { name: "ZuluTrade — Blog", url: "https://blog.zulutrade.com/" },
      { name: "NAGA — Blog", url: "https://blog.naga.com/" },
    ]},

  // ─── Royalties ─────────────────────────────────────────────────
  { id: "music-royalties", label: "Music Royalties", emoji: "🎵", description: "Music royalty catalogue deals", group: "royalties",
    sources: [
      { name: "Royalty Exchange", url: "https://www.royaltyexchange.com/marketplace" },
      { name: "ANote Music", url: "https://www.anotemusic.com/marketplace" },
      { name: "SongVest", url: "https://www.songvest.com/royalties" },
      { name: "Hipgnosis Songs Fund", url: "https://www.hipgnosissongs.com/news" },
      { name: "MBW — Catalogues", url: "https://www.musicbusinessworldwide.com/categories/business/catalogue-acquisitions/" },
    ]},
  { id: "film-royalties", label: "Film Royalties", emoji: "🎬", description: "Film & TV royalty investments", group: "royalties",
    sources: [
      { name: "Variety — Film Finance", url: "https://variety.com/v/film/" },
      { name: "Deadline — Film", url: "https://deadline.com/v/film/" },
    ]},
  { id: "publishing-royalties", label: "Publishing Royalties", emoji: "📚", description: "Book & publishing royalty deals", group: "royalties",
    sources: [
      { name: "Publishers Weekly", url: "https://www.publishersweekly.com/pw/corp/index.html" },
    ]},
  { id: "patent-royalties", label: "Patent Royalties", emoji: "🧪", description: "Patent licensing & royalty plays", group: "royalties",
    sources: [
      { name: "IAM Media", url: "https://www.iam-media.com" },
      { name: "IPWatchdog", url: "https://ipwatchdog.com" },
    ]},

  // ─── Businesses ────────────────────────────────────────────────
  { id: "businesses", label: "Businesses", emoji: "🤝", description: "SME & business acquisition deals", group: "businesses",
    sources: [
      { name: "BizBuySell", url: "https://www.bizbuysell.com/learning-center/" },
      { name: "Axial Forum", url: "https://www.axial.net/forum/" },
      { name: "Business Sale Report", url: "https://www.business-sale.com/insights" },
      { name: "Insider Media", url: "https://www.insidermedia.com/news/national/all" },
    ]},

  // ─── Mini Bonds / Loan Notes ───────────────────────────────────
  { id: "mini-bonds", label: "Mini Bonds & Loan Notes", emoji: "🏦", description: "Corporate mini-bond & loan-note issues", group: "mini_bonds",
    sources: [
      { name: "Private Debt Investor", url: "https://www.privatedebtinvestor.com" },
      { name: "GlobalCapital — Loans", url: "https://www.globalcapital.com/loans" },
    ]},

  // ─── Timepieces ────────────────────────────────────────────────
  { id: "timepieces", label: "Timepieces", emoji: "⌚", description: "Investment-grade watches: Rolex, Patek Philippe", group: "timepieces",
    sources: [
      { name: "WatchPro", url: "https://www.watchpro.com/news/" },
      { name: "Hodinkee", url: "https://www.hodinkee.com" },
      { name: "WatchCharts", url: "https://watchcharts.com/blog" },
      { name: "Chrono24 Magazine", url: "https://www.chrono24.com/magazine/" },
    ]},

  // ─── Fine Wine ─────────────────────────────────────────────────
  { id: "fine-wine", label: "Fine Wine", emoji: "🍷", description: "Investment-grade Bordeaux & Burgundy", group: "fine_wine",
    sources: [
      { name: "Liv-ex — News", url: "https://www.liv-ex.com/news-insights/" },
      { name: "Decanter", url: "https://www.decanter.com/wine-news/" },
      { name: "The Drinks Business", url: "https://www.thedrinksbusiness.com/category/news/" },
    ]},

  // ─── Art ───────────────────────────────────────────────────────
  { id: "art", label: "Art", emoji: "🖼️", description: "Fine art & blue-chip artist markets", group: "art",
    sources: [
      { name: "Artnet News — Market", url: "https://news.artnet.com/market" },
      { name: "ArtTactic", url: "https://arttactic.com/articles/" },
      { name: "The Art Newspaper", url: "https://www.theartnewspaper.com/art-market" },
    ]},

  // ─── Collectibles ──────────────────────────────────────────────
  { id: "rare-whisky", label: "Rare Whisky", emoji: "🥃", description: "Rare cask & bottle whisky", group: "collectibles",
    sources: [
      { name: "Rare Whisky 101", url: "https://www.rarewhisky101.com/news" },
      { name: "Whisky Auctioneer", url: "https://whiskyauctioneer.com/news" },
    ]},
  { id: "sneakers", label: "Sneakers", emoji: "👟", description: "Resale sneaker market", group: "collectibles",
    sources: [
      { name: "StockX News", url: "https://stockx.com/news" },
      { name: "Sole Retriever", url: "https://www.soleretriever.com" },
    ]},
  { id: "comics", label: "Comics", emoji: "📖", description: "Vintage & key-issue comics", group: "collectibles",
    sources: [
      { name: "GoCollect — Comics", url: "https://gocollect.com/blog" },
      { name: "ComicBook.com", url: "https://comicbook.com/category/comics/" },
    ]},
  { id: "trading-cards", label: "Trading Cards", emoji: "🃏", description: "Sports & TCG cards", group: "collectibles",
    sources: [
      { name: "PSA Card — News", url: "https://www.psacard.com/articles" },
      { name: "Card Ladder", url: "https://www.cardladder.com/news" },
    ]},
  { id: "memorabilia", label: "Memorabilia", emoji: "🏆", description: "Signed & historical memorabilia", group: "collectibles",
    sources: [
      { name: "Heritage Auctions", url: "https://www.ha.com/c/news.zx" },
      { name: "Goldin Auctions", url: "https://goldin.co/blog" },
    ]},

  // ─── Luxury Assets ─────────────────────────────────────────────
  { id: "yachts", label: "Yachts", emoji: "🛥️", description: "Yacht acquisitions & syndicates", group: "luxury_assets",
    sources: [
      { name: "Boat International", url: "https://www.boatinternational.com/yachts" },
      { name: "SuperYacht Times", url: "https://www.superyachttimes.com/yacht-news" },
    ]},
  { id: "jets", label: "Jets", emoji: "✈️", description: "Private jet ownership & fractional", group: "luxury_assets",
    sources: [
      { name: "Corporate Jet Investor", url: "https://www.corporatejetinvestor.com" },
      { name: "AIN Online — Business Aviation", url: "https://www.ainonline.com/aviation-news/business-aviation" },
    ]},
  { id: "supercars", label: "Supercars", emoji: "🏎️", description: "Classic & supercar investments", group: "luxury_assets",
    sources: [
      { name: "Hagerty", url: "https://www.hagerty.com/media/" },
      { name: "Classic Car Auctions", url: "https://www.classiccarauctions.co.uk/news" },
    ]},
  { id: "rare-handbags", label: "Rare Handbags", emoji: "👜", description: "Hermès, Chanel & investment handbags", group: "luxury_assets",
    sources: [
      { name: "Sotheby's — Handbags", url: "https://www.sothebys.com/en/buy/handbags-and-accessories" },
      { name: "Rebag — Clair Report", url: "https://www.rebag.com/clair" },
    ]},
  { id: "jewelry", label: "Jewelry", emoji: "💍", description: "Investment-grade jewelry & gems", group: "luxury_assets",
    sources: [
      { name: "Rapaport", url: "https://www.diamonds.net/News/" },
      { name: "Sotheby's — Jewels", url: "https://www.sothebys.com/en/buy/jewelry" },
    ]},

  // ─── Entertainment Finance ─────────────────────────────────────
  { id: "film-financing", label: "Film Financing", emoji: "🎥", description: "Slate financing & film deals", group: "entertainment_finance",
    sources: [
      { name: "Variety — Film Finance", url: "https://variety.com/v/film/" },
      { name: "Screen Daily — Finance", url: "https://www.screendaily.com/business/finance" },
    ]},
  { id: "tv-production-finance", label: "TV Production Finance", emoji: "📺", description: "TV slate & production finance", group: "entertainment_finance",
    sources: [
      { name: "Broadcast Now", url: "https://www.broadcastnow.co.uk/news" },
      { name: "Variety — TV", url: "https://variety.com/v/tv/" },
    ]},
  { id: "sports-rights", label: "Sports Rights", emoji: "📡", description: "Sports media & broadcast rights", group: "entertainment_finance",
    sources: [
      { name: "SportsPro Media", url: "https://www.sportspromedia.com" },
      { name: "SportBusiness", url: "https://www.sportbusiness.com" },
    ]},
  { id: "esports", label: "Esports Organizations", emoji: "🎮", description: "Esports team & league investments", group: "entertainment_finance",
    sources: [
      { name: "Esports Insider", url: "https://esportsinsider.com" },
      { name: "The Esports Observer", url: "https://archive.esportsobserver.com" },
    ]},

  // ─── Insurance-Based Investments ───────────────────────────────
  { id: "annuities", label: "Annuities", emoji: "📅", description: "Annuity & guaranteed income products", group: "insurance_investments",
    sources: [
      { name: "Money Marketing — Annuities", url: "https://www.moneymarketing.co.uk/news/retirement/annuities/" },
      { name: "Pensions Age — Annuities", url: "https://www.pensionsage.com/pa/news.php" },
    ]},
  { id: "whole-life-insurance", label: "Whole Life Insurance", emoji: "🛡️", description: "Whole life policies as investments", group: "insurance_investments",
    sources: [
      { name: "Insurance Times", url: "https://www.insurancetimes.co.uk" },
    ]},
  { id: "universal-life-policies", label: "Universal Life Policies", emoji: "🔐", description: "Universal life investment policies", group: "insurance_investments",
    sources: [
      { name: "ThinkAdvisor — Life Insurance", url: "https://www.thinkadvisor.com/life-insurance/" },
    ]},
  { id: "premium-finance", label: "Premium Finance Structures", emoji: "💷", description: "Premium-financed life policies", group: "insurance_investments",
    sources: [
      { name: "ThinkAdvisor — Premium Finance", url: "https://www.thinkadvisor.com" },
    ]},
  { id: "life-settlements", label: "Life Settlements", emoji: "📜", description: "Life settlement secondary market", group: "insurance_investments",
    sources: [
      { name: "Life Settlements Report", url: "https://www.thedeal.com/life-settlements/" },
      { name: "LISA — Life Settlements", url: "https://www.lisa.org/news" },
    ]},

  // ─── Sports Investments ────────────────────────────────────────
  { id: "football-clubs", label: "Football Clubs", emoji: "⚽", description: "Football club ownership & equity", group: "sports_investments",
    sources: [
      { name: "Football Benchmark", url: "https://www.footballbenchmark.com/library" },
      { name: "SportsPro — Football", url: "https://www.sportspromedia.com/football/" },
    ]},
  { id: "athlete-ventures", label: "Athlete-Backed Ventures", emoji: "🏀", description: "Athlete-backed funds & ventures", group: "sports_investments",
    sources: [
      { name: "Front Office Sports", url: "https://frontofficesports.com" },
      { name: "Sportico", url: "https://www.sportico.com" },
    ]},
  { id: "sports-trading-cards", label: "Sports Trading Cards", emoji: "🎴", description: "Investment-grade sports cards", group: "sports_investments",
    sources: [
      { name: "PSA Card", url: "https://www.psacard.com/articles" },
      { name: "Card Ladder — Sports", url: "https://www.cardladder.com/news" },
    ]},
  { id: "racehorses", label: "Racehorses", emoji: "🐎", description: "Racehorse ownership & syndicates", group: "sports_investments",
    sources: [
      { name: "Racing Post", url: "https://www.racingpost.com/news" },
      { name: "Thoroughbred Daily News", url: "https://www.thoroughbreddailynews.com" },
    ]},
];

// Backward-compat exports used by existing scraper UIs.
export const INVESTMENT_CATEGORIES: InvestmentCategory[] = INVESTOR_OPPORTUNITY_TOPICS;
export const INVESTOR_ONLY_CATEGORIES: InvestmentCategory[] = INVESTOR_OPPORTUNITY_TOPICS;
export const INVESTOR_CATEGORIES: InvestmentCategory[] = INVESTOR_OPPORTUNITY_TOPICS;
export const ALL_CATEGORIES: InvestmentCategory[] = INVESTOR_OPPORTUNITY_TOPICS;
export const INVESTOR_CATEGORY_IDS: string[] = INVESTOR_OPPORTUNITY_TOPICS.map((c) => c.id);

export const getCategoryById = (id: string) =>
  INVESTOR_OPPORTUNITY_TOPICS.find((c) => c.id === id);
